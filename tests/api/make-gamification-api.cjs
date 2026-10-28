// Builds gamification-api.cjs: the review-api harness (temp copies of every table, rolled back) plus XP from study
// activities, daily caps, levels, achievements with progress and level-up notifications.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Gamification: XP sources, daily caps, levels, achievements")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/lessons', src('routes/lesson.routes.ts').default); app.use('/api/srs', src('routes/srs.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/lesson.routes.ts', "'ben']"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const learnerId = await uid(L), benId = await uid('ben');
    const summary = async (as = L) => (await call('GET', '/profile/me/gamification', { as })).data;
    const achievement = (data, id) => data.achievements.find(item => item.id === id);
    const HELLO = 'japanese-n5-unit-1-hello';

    // ---- a new learner: level 1, nothing earned, every achievement listed with its goal
    assert.equal((await call('GET', '/profile/me/gamification')).status, 401);
    const raw = await call('GET', '/profile/me/gamification', { as: L }); assert.equal(raw.status, 200, JSON.stringify(raw.data));
    let data = await summary();
    assert.deepEqual([data.xp, data.level.level, data.level.nextLevelXp, data.rank, data.nextRank.name], [0, 1, 100, 'Beginner', 'Bronze']);
    assert.ok(data.achievements.length >= 30, 'the whole catalogue');
    assert.ok(data.achievements.every(item => item.earnedAt === null && item.progress === (item.category === 'levels' ? 1 : 0) && item.goal >= 1 && item.icon && item.category));
    assert.deepEqual(data.today.activities.find(item => item.source === 'review'), { source: 'review', amount: 2, dailyCap: 60, earned: 0 });

    // ---- a perfect first lesson: lesson XP, two achievements, and a level up announced in the bell
    const done = await call('POST', '/lessons/' + HELLO + '/complete', { as: L, body: { challengeScore: 100 } });
    assert.equal(done.status, 200, JSON.stringify(done.data).slice(0, 300));
    assert.deepEqual(done.data.achievements.sort(), ['first_steps', 'perfect_score']);
    assert.deepEqual([done.data.reward.xpEarned, done.data.reward.xp, done.data.reward.level, done.data.reward.leveledUp], [75, 150, 2, true], '50 + 25 lesson XP, then 25 + 50 from the achievements');
    const levelUps = (await client.query("SELECT data FROM notifications WHERE user_id = $1 AND kind = 'level_up'", [learnerId])).rows.map(row => row.data);
    assert.deepEqual(levelUps, [{ level: 2 }]);
    data = await summary();
    assert.ok(achievement(data, 'first_steps').earnedAt, 'earned');
    assert.deepEqual([achievement(data, 'lessons_10').progress, achievement(data, 'lessons_10').goal], [1, 10], 'progress toward the next one');
    assert.deepEqual(data.recent.map(event => event.source).sort(), ['achievement', 'achievement', 'lesson_challenge', 'lesson_completion']);
    assert.equal(data.today.xp, 150);
    // Repeating the lesson pays nothing and earns nothing new.
    const again = await call('POST', '/lessons/' + HELLO + '/complete', { as: L, body: { challengeScore: 100 } });
    assert.deepEqual([again.data.reward.xpEarned, again.data.reward.leveledUp, again.data.achievements], [0, false, []]);

    // ---- review XP and its daily cap
    await call('POST', '/srs/cards', { as: L, body: { items: [{ itemType: 'kanji', itemId: 'kanji-65e5' }, { itemType: 'kanji', itemId: 'kanji-4e00' }, { itemType: 'kanji', itemId: 'kanji-4e8c' }] } });
    const review = itemId => call('POST', '/srs/reviews', { as: L, body: { itemType: 'kanji', itemId, grade: 'good' } });
    let reviewed = await review('kanji-65e5');
    assert.equal(reviewed.status, 200, JSON.stringify(reviewed.data));
    assert.equal(reviewed.data.reward.xpEarned, 2);
    // 57 more review XP today leaves 1 under the cap of 60.
    await client.query("INSERT INTO xp_events (user_id, amount, source, reference_id) VALUES ($1, 57, 'review', 'test-earlier-reviews')", [learnerId]);
    assert.equal((await review('kanji-4e00')).data.reward.xpEarned, 1, 'only what is left of the cap');
    reviewed = await review('kanji-4e8c');
    assert.deepEqual([reviewed.status, reviewed.data.reward.xpEarned], [200, 0], 'the review is still saved once the cap is reached');
    data = await summary();
    assert.equal(data.today.activities.find(item => item.source === 'review').earned, 60);
    assert.equal(achievement(data, 'reviews_100').progress, 3);
    // Caps follow the learner's day: yesterday's review XP does not count today.
    await client.query("UPDATE xp_events SET created_at = NOW() - INTERVAL '2 days' WHERE user_id = $1 AND source = 'review'", [learnerId]);
    assert.equal((await summary()).today.activities.find(item => item.source === 'review').earned, 0);

    // ---- level achievements, and achievement XP can itself raise the level
    await client.query('UPDATE user_gamification SET xp = 690 WHERE user_id = $1', [benId]);
    const benReward = await src('services/gamification.service.ts').rewardActivity(benId, 'daily_goal', 'goal:test-day');
    assert.deepEqual([benReward.xpEarned, benReward.leveledUp], [20, true], '690 + 20 reaches level 5 (700)');
    assert.ok(benReward.achievements.includes('level_5'));
    assert.equal(achievement(await summary('ben'), 'goal_7').progress, 1, 'met daily goals count toward Goal Getter');
    assert.equal((await src('services/gamification.service.ts').rewardActivity(benId, 'daily_goal', 'goal:test-day')).xpEarned, 0, 'the daily goal pays once per day');

    // ---- friends: accepting a friendship earns Study Buddy for both learners
    await client.query("INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1, $2, 'pending')", [benId, learnerId]);
    const requestId = (await client.query('SELECT id FROM friendships WHERE requester_id = $1', [benId])).rows[0].id;
    await src('services/friend.service.ts').respondToFriendRequest(learnerId, String(requestId), true);
    assert.ok(achievement(await summary(), 'friends_1').earnedAt);
    assert.ok(achievement(await summary('ben'), 'friends_1').earnedAt);
    console.log('PASS: new learner level 1 with the full catalogue at 0 (levels at 1); a perfect first lesson pays 75 XP, earns First Steps and Perfect Score, reaches level 2 and puts a level-up in the bell; repeats pay nothing; review XP stops at the daily cap (60) but the review is saved, and caps reset with the day; achievement progress (lessons 1/10, reviews 3/100, goals 1/7); daily goal XP once per day and level 5 earned through it; accepting a friend earns Study Buddy for both. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'gamification-api.cjs'), head + tail);
console.log('written');

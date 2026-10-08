// Real app navigation regression; all API requests are fixtures, never user data.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.setItem('token', 'test.' + btoa(JSON.stringify({userId: 999999999})) + '.fixture');
      localStorage.setItem('app_language', 'japanese');
    });
    const characters = ['あ','い','う','え','お'].map((kana,i) => ({id:i+1,kana,romaji:['a','i','u','e','o'][i],correctCount:0,wrongCount:0,total:0,accuracy:0,status:'untested'}));
    const mode = {totalCorrect:0,totalWrong:0,totalAnswers:0,accuracy:0,characters};
    await context.route('http://localhost:5000/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      let data = {};
      if(path.endsWith('/units')) data={units:[]};
      else if(path.endsWith('/profile/me')) data={display_name:'Test',username:'test',xp:0,level:1,rank:'Beginner',current_streak:0,achievements_count:0,achievements:[],xpProgress:{progressPercent:0,nextLevelXp:100}};
      else if(path.endsWith('/quiz/characters')) data={characters};
      else if(path.endsWith('/statistics')) data={...mode,hiragana:mode,katakana:mode};
      else if(path.endsWith('/kanji/progress')) data={progress:[]};
      else if(path.endsWith('/assessment')) data={assessmentId:'test',unitNumber:1,title:'Test assessment',questions:[{id:'one',prompt:'Test question',options:['One','Two']}]};
      return route.fulfill({json:data});
    });
    const page=await context.newPage(); const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const back=()=>page.getByRole('button',{name:'← Back',exact:true});
    for(const width of [1366,390]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base);
      for(const [path,title] of [['/vocabulary','Vocabulary'],['/grammar','Grammar'],['/learn/hiragana','Hiragana'],['/learn/katakana','Katakana'],['/review/hiragana','Hiragana Review'],['/review/katakana','Katakana Review'],['/learn/kanji','Kanji']]) {
        await page.locator(`main a[href="${path}"]`).first().click();
        await page.getByRole('heading',{name:title,exact:true}).waitFor();
        assert.equal(new URL(page.url()).pathname,path);
        assert.equal(await back().count(),1,`${width}: ${path} needs exactly one return button`);
        assert.ok(await back().isVisible());
        if(path.startsWith('/review/')) await page.getByRole('button',{name:'Start Review',exact:true}).waitFor();
        await back().click();
        await page.getByRole('heading',{name:'Your Japanese learning hub',exact:true}).waitFor();
      }
      for(const path of ['/lessons','/quizzes','/practice?type=hiragana','/practice?type=katakana','/learn/kanji/practice','/profile','/statistics/japanese','/learn/hiragana/1','/learn/katakana/1','/arcade','/lessons/japanese/n5-unit-1-hello','/quizzes/test']) {
        await page.goto(base+path);
        if(await page.getByRole('button',{name:'Start new session',exact:true}).isVisible()) await page.getByRole('button',{name:'Start new session',exact:true}).click();
        await back().waitFor();
        assert.equal(await back().count(),1,`${width}: ${path} duplicate return buttons`);
      }
      // Clear only the fixture session before the next viewport pass.
      await page.evaluate(()=>localStorage.removeItem('learning-session-v1:999999999'));
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: actual dashboard review destinations and setup screens; exactly one return button across 21 routes at desktop/mobile widths; dashboard return flow. Fixture APIs only.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

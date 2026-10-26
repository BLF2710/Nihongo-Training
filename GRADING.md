# Grading System

How writing and speaking answers are graded on the site. The system is aligned with the **JF Standard for Japanese-Language Education** (JF日本語教育スタンダード) from the Japan Foundation. Like the CEFR, it describes ability with six levels, **A1, A2, B1, B2, C1, C2**, and with **Can-do statements**: what a learner can do in Japanese, for a type of language activity.

Code: `nihon-api/src/grading/` (`jfGrading.ts` holds the bands and the score calculation).

---

## 1. The core idea: grading against a target level

Every writing or speaking task is written for **one target level** and practises **one Can-do**. A learner isn't compared with a native speaker. They're compared with what a learner at that level should be able to do.

An A2 learner who writes five simple, correct sentences about their weekend has fully met an A2 task, even though a B2 learner would be expected to write much more.

### Course levels and JF levels

The course is organised by JLPT level (N5 to N1), but grading uses JF levels. There is **no official table linking the JLPT to the JF Standard or the CEFR**, so this mapping is a course design choice, used to set each task's target level:

| Course level | Target JF level |
|---|---|
| N5 | A1 |
| N4 | A2 |
| N3 | B1 |
| N2 | B2 |
| N1 | C1 |

C2 is kept in the scales below for completeness; no course level targets it yet.

## 2. Task types

The JF Standard groups language use into activities. The site uses these:

| Task type | JF activity | Used for |
|---|---|---|
| **Spoken production** 口頭産出 | Speaking on your own: describing, explaining, telling a story | Speaking test (N3 and above) |
| **Spoken interaction** 口頭でのやりとり | Speaking with someone: answering, asking, reacting in a conversation | Speaking test (N3 and above) |
| **Read-aloud** 音読 | Not a Can-do activity of its own: a delivery exercise | Speaking test (N3 and above) |
| **Written production** 書くこと | Writing on your own | Writing (not built yet) |

### Speaking at N5 and N4 (A1–A2): practice, not a graded test

At A1 and A2 the JF Can-dos for speaking are mostly about short, memorised expressions in familiar situations (greeting, introducing yourself, answering simple questions). The N5 and N4 **Speaking practice** keeps its simpler check, which fits those Can-dos:

- The learner says a word, a sentence, or one side of a short dialogue from the lesson.
- The browser's speech recogniser writes down what it heard. Both texts are turned into kana with the course's own readings, and compared character by character.
- **80 % similar or more counts as said correctly.** A negative ending (ません, ない) must match exactly, because it changes the meaning.
- The learner can retry as often as they like. It's practice feedback, with no band or score.

Free answers at A1–A2 are only a few words long, and grading them with the full criteria below would mostly measure noise.

### Speaking at N3 and above (B1+): the speaking test

From N3, the **Speaking test** grades free answers with the full criteria in section 5. It opens when the learner reaches that level (every unit of the levels before it completed), or when an administrator unlocks all lessons for them.

---

## 3. Bands

Each criterion gets one of four bands, relative to the target level. This is the four-step scale commonly used in JF Standard classrooms.

| Band | Label | Meaning | Points |
|:---:|---|---|:---:|
| 1 | がんばろう *(ganbarou)* | Not yet at the target level | 25 |
| 2 | もうすこし *(mou sukoshi)* | Partly meets the target level | 50 |
| 3 | できました *(dekimashita)* | **Meets the target level** | 75 |
| 4 | すばらしい *(subarashii)* | Clearly exceeds the target level | 100 |

## 4. How the final score is calculated

1. Each criterion's band is turned into points (see the table above).
2. Points are multiplied by the criterion's **weight** and added up, which gives a **score from 25 to 100** (every band is worth at least 25 points).
3. The score is turned back into an overall band:

| Score | Overall band |
|---|---|
| 88–100 | 4 すばらしい |
| 63–87 | 3 できました |
| 38–62 | 2 もうすこし |
| 25–37 | 1 がんばろう |

4. **The target is met when the overall band is 3 or higher** (a score of 63 or more).

**Example:** a writing answer that gets band 3 on every criterion scores **75**. That's できました, and the target is met.

### Criteria that couldn't be assessed

If a criterion couldn't be assessed (for example, pronunciation when the pronunciation service isn't configured), it's left out and the other weights are scaled up so they still add up to 100 %. The result says which criteria were left out, so a score without pronunciation is never mistaken for a full score.

### No answer

An empty recording, silence, or an answer in another language isn't scored at all. The learner sees "No answer recognised" and can try again; nothing is saved. This keeps band 1 for real attempts that don't yet meet the level.

---

## 5. Writing criteria (not built yet)

All writing criteria are judged by the AI, using the descriptors for the target level and the levels just above and below it.

| Criterion | Weight | What it checks |
|---|:---:|---|
| **Task achievement** 課題達成 | **30%** | Did the learner do what the task asked, with enough content and detail for the level? Includes length limits. |
| **Organization & cohesion** 構成・まとまり | **20%** | Is the text ordered logically, and are ideas linked with connectors suited to the level (そして, でも → だから, しかし → 一方で, このように)? |
| **Vocabulary** 語彙 | **20%** | Range and accuracy of word choice. Higher levels expect more variety and Sino-Japanese (漢語) words. |
| **Grammar** 文法 | **20%** | Range and accuracy of structures: particles, conjugation, て-form, conditionals, relative clauses and so on. |
| **Script & style** 表記・文体 | **10%** | Kana and kanji use, okurigana, punctuation, and keeping one style throughout (です・ます or だ・である). |

**Why these weights:** task achievement matters most because the JF Standard is about *what you can do* in Japanese, not how much grammar you know. Script & style counts least because small notation slips rarely stop communication.

### What "meets the level" looks like (writing, summarised)

| Level | Task achievement | Organization | Vocabulary & grammar |
|---|---|---|---|
| **A1** | Isolated words and set phrases giving basic personal info | Very basic links (と, そして) | A few memorised patterns (です／ます, basic particles) |
| **A2** | A short series of simple sentences covering the main points | Simple connectors (でも, それから, ～から) | Simple structures; basic particle and conjugation slips still common |
| **B1** | Connected text covering every point, with brief reasons | Clear beginning, middle and end | Common patterns used fairly accurately; errors rarely hide meaning |
| **B2** | Every point developed with reasons and examples | Paragraphs and a range of connectors | Complex sentences; some 漢語; errors occasional |
| **C1** | Complex topics in depth with a fitting conclusion | Controlled structure and referencing | Broad, precise, idiomatic; errors rare |
| **C2** | Sophisticated, persuasive, nuanced | Structure guides the reader | Native-like precision and control |

---

## 6. Speaking test criteria (N3 and above)

Speaking uses two sources. The **AI** grades *what* was said from a transcript, and **Azure pronunciation assessment** grades *how* it sounded. An AI reading a transcript can't hear pronunciation.

### Spoken production and spoken interaction

| Criterion | Weight | Scored by | What it checks |
|---|:---:|---|---|
| **Task achievement** 課題達成 | **20%** | AI | Did the answer respond to the task with enough content for the level? For interaction: did it answer the other speaker appropriately? |
| **Coherence** まとまり | **10%** | AI | Are ideas linked into a clear sequence? |
| **Vocabulary** 語彙 | **15%** | AI | Range and accuracy of words |
| **Grammar** 文法 | **15%** | AI | Range and accuracy of structures |
| **Pronunciation** 発音 | **20%** | Azure | Accuracy of sounds, including special mora (long vowels, っ, ん) |
| **Fluency** 流暢さ | **20%** | Azure | Smoothness and pace; pauses and hesitation |

Content and language make up 60% and delivery makes up 40%. Pronunciation and fluency get a large share because speaking feedback is what learners have the hardest time getting anywhere else.

**How free answers are assessed by Azure.** Azure's short-audio REST API only assesses pronunciation against a *reference text*. For a free answer there's no script, so the server makes two calls: first it recognises the speech to get a transcript, then it assesses the recording against that transcript. This measures how well the learner said *what they said*. Whether they said the *right thing* is judged by the AI.

### Read-aloud

The learner reads a short passage written for the level. The passage is the reference text, so Azure can also check that nothing was skipped. There's no AI step: the content is fixed.

| Criterion | Weight | Scored by | What it checks |
|---|:---:|---|---|
| **Pronunciation** 発音 | **50%** | Azure | Accuracy of sounds, including special mora |
| **Fluency** 流暢さ | **30%** | Azure | Smoothness and pace |
| **Completeness** 完全さ | **20%** | Azure | Share of the passage actually read (skipped words lower it) |

Without Azure, read-aloud is checked like the N5–N4 practice: the browser's transcript is compared with the passage, and the match (0–100) becomes a single **Recognised accuracy** criterion, using the same thresholds as pronunciation. The result says that pronunciation and fluency weren't assessed.

### Pronunciation, fluency and completeness thresholds

Azure returns a 0–100 score, which is turned into a band. The bar rises with the level, so beginners aren't punished for a normal learner accent.

| Target level | Band 2 from | Band 3 from | Band 4 from |
|---|:---:|:---:|:---:|
| A1 | 40 | 55 | 70 |
| A2 | 45 | 60 | 75 |
| B1 | 55 | 70 | 82 |
| B2 | 60 | 75 | 87 |
| C1 | 65 | 80 | 92 |
| C2 | 70 | 85 | 95 |

Example: a pronunciation score of 62 is band 3 (meets the target) for an A2 task, but band 2 for a B2 task.

---

## 7. What the learner gets back

| Field | Description |
|---|---|
| **Score & band** | 25–100 score, overall band, and whether the target was met |
| **Per-criterion feedback** | A band and a short comment for each criterion, and which criteria couldn't be assessed. Speaking also shows the raw Azure scores. |
| **Corrections** | Up to 12 mistakes, each with the exact excerpt, a corrected version, a category and an explanation. The server finds each excerpt in the transcript and adds its position, so the UI can highlight it inline; an excerpt that isn't in the transcript is dropped. |
| **Summary, strengths, next steps** | A short overall comment, up to 3 strengths, and up to 3 concrete things to practise next |
| **Estimated level** | The AI's rough guess of the learner's level from this one answer. **Indicative only.** |
| **Transcript & word scores** | Speaking only: what was recognised, and which words were mispronounced (when Azure was used) |

Feedback is written in English for now (the site's only interface language). Corrections stay in Japanese.

### Correction categories

`particle` · `conjugation` · `grammar` · `vocabulary` · `kanji-kana` · `register` · `word-order` · `other`

The AI is told to correct only mistakes that matter at the target level, so a learner isn't buried in advanced style notes. In speaking, `kanji-kana` isn't used: the transcript's script comes from the recogniser, not the learner.

---

## 8. Measurements given to the AI

Before grading, the system measures the answer in code and gives the numbers to the AI to anchor its judgement. This is the same approach jWriter uses.

**Writing:**
- Character count, and whether it fits the task's length limits
- Number of sentences and average sentence length
- Kanji ratio
- Word count, unique words and lexical diversity
- Number of です・ます sentences vs plain-form sentences (to catch mixed styles)

**Speaking:**
- Recording length, and whether it reached the task's minimum
- Characters in the transcript and characters per second (a rough pace)
- Number of sentences
- Number of です・ます sentences vs plain-form sentences

---

## 9. Where grading runs, fallbacks and privacy

- **Grading runs on the server.** The browser only records and uploads; scores are computed and saved by the server, so they can be trusted for progress.
- **Without Azure** (no Speech key configured): the browser's own recogniser provides the transcript, pronunciation and fluency aren't assessed, and the weights are scaled as in section 4. The learner is told.
- **Without the AI** (no Anthropic key configured): production and interaction tasks can't be graded. The learner is told to try later, and nothing is saved. Read-aloud still works.
- **Consent.** Before the first recording the learner is told what is sent where: the recording to Microsoft Azure (when configured) for pronunciation scoring, and the transcript to Anthropic for content grading.
- **Storage.** Recordings are never stored. The transcript, the scores and the feedback are saved so the learner can see their history.
- **Limits.** Answers are up to **30 seconds** (Azure's limit for pronunciation assessment over the REST API), and each learner can have **30 answers graded per day**.

---

## 10. Limits and good practice

- **AI grades are feedback, not certification.** Research comparing AI with teachers on Japanese essays found AI is weaker at judging content, naturalness and nuance. Don't use these scores alone for placement or certificates. Every result has a **Report this grade** button that opens a Help & support request with the result attached.
- **The descriptors are our own wording,** aligned with the JF/CEFR levels; they aren't the official JF Can-do text. For best results, link each task to the real JF Can-do it practises (the `canDo` field).
- **Speech recognisers make mistakes.** A wrong transcript can lower content scores for something the learner said correctly; the result always shows the transcript so the learner can tell.
- **Calibrate before launch.** Have a teacher grade 30–50 real answers per level, compare with the AI, then adjust weights, descriptors and speech thresholds.

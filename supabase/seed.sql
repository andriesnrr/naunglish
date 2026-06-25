-- ============================================================
-- Naunglish — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Grammar Questions (10)
insert into questions (skill, difficulty, type, prompt, options, answer, explanation, tags) values
('grammar', 'B1', 'mcq',
 'She _____ to the store before the rain started.',
 '["goes", "went", "has gone", "had gone"]', 3,
 'Past perfect (had gone) shows action completed before another past event.',
 '{"past-perfect", "tense"}'),

('grammar', 'B1', 'mcq',
 'If I _____ more time, I would study harder.',
 '["have", "had", "would have", "having"]', 1,
 'Second conditional: "If + past simple, would + infinitive" for unreal present situations.',
 '{"conditionals", "second-conditional"}'),

('grammar', 'B2', 'mcq',
 'The report _____ by the team last Friday.',
 '["was submitted", "submitted", "has submitted", "submits"]', 0,
 'Passive voice past simple: "was/were + past participle."',
 '{"passive-voice", "past-simple"}'),

('grammar', 'B2', 'mcq',
 'Not only _____ late, but he also forgot his homework.',
 '["he arrived", "arrived he", "did he arrive", "he did arrive"]', 2,
 'Negative inversion with "not only": auxiliary verb precedes subject.',
 '{"inversion", "emphasis"}'),

('grammar', 'B1', 'mcq',
 'I wish I _____ speak French fluently.',
 '["can", "could", "will", "would"]', 1,
 '"Wish + past simple" expresses desire for present/future change.',
 '{"wish-clauses", "modals"}'),

('grammar', 'C1', 'mcq',
 'Having _____ the assignment, she felt relieved.',
 '["finished", "finish", "been finished", "finishing"]', 0,
 'Participial clause: "Having + past participle" for action completed before main clause.',
 '{"participles", "perfect-participle"}'),

('grammar', 'B2', 'mcq',
 'The scientist whose _____ was published is presenting today.',
 '["research", "researches", "researching", "researched"]', 0,
 'Relative clause with "whose" + noun. "Research" is uncountable.',
 '{"relative-clauses", "whose"}'),

('grammar', 'B1', 'mcq',
 'Neither the students nor the teacher _____ ready.',
 '["were", "was", "are", "is"]', 1,
 '"Neither...nor" verb agrees with the closer subject ("teacher" = singular = "was").',
 '{"subject-verb-agreement", "correlative-conjunctions"}'),

('grammar', 'C1', 'mcq',
 'It is essential that every student _____ the exam.',
 '["passes", "pass", "passed", "passing"]', 1,
 'Subjunctive mood after "essential that": base form (no -s).',
 '{"subjunctive", "that-clauses"}'),

('grammar', 'B2', 'mcq',
 'He spoke so quietly that we could _____ hear him.',
 '["hardly", "hard", "scarcely ever", "barely ever"]', 0,
 '"Hardly" = almost not. Fits "could hardly hear" — near impossibility.',
 '{"adverbs", "degree"}');

-- Vocabulary Questions (10)
insert into questions (skill, difficulty, type, prompt, options, answer, explanation, tags) values
('vocab', 'B2', 'mcq',
 'The new policy will _____ employees to work from home three days a week.',
 '["enable", "allow", "permit", "entitle"]', 3,
 '"Entitle" = give official right to. Others work but "entitle" is most precise for policy/rights context.',
 '{"formal-vocab", "verbs"}'),

('vocab', 'B1', 'mcq',
 'The lecture was so _____ that several students fell asleep.',
 '["monotonous", "rhythmic", "repetitive", "dull"]', 0,
 '"Monotonous" = tediously unvarying. Stronger and more precise than "dull" in academic context.',
 '{"adjectives", "academic-vocab"}'),

('vocab', 'B2', 'mcq',
 'Her _____ to detail made her an excellent editor.',
 '["attendance", "attention", "attraction", "attitude"]', 1,
 '"Attention to detail" — fixed collocation.',
 '{"collocations", "nouns"}'),

('vocab', 'C1', 'mcq',
 'The politician tried to _____ the scandal by changing the subject.',
 '["overlook", "bypass", "deflect", "ignore"]', 2,
 '"Deflect" = redirect attention away from. "Deflect criticism/scrutiny" is a key C1 collocation.',
 '{"C1-vocab", "verbs", "politics"}'),

('vocab', 'B1', 'mcq',
 'We need to _____ a solution to this problem as soon as possible.',
 '["find", "devise", "invent", "create"]', 1,
 '"Devise a solution/plan" — academic collocation. "Find" is too informal for writing context.',
 '{"collocations", "academic-vocab"}'),

('vocab', 'B2', 'mcq',
 'The company''s profits have been _____ declining over the past year.',
 '["steadily", "constantly", "continuously", "regularly"]', 0,
 '"Steadily declining" — standard academic/business collocation.',
 '{"adverbs", "collocations", "business"}'),

('vocab', 'C1', 'mcq',
 'The new evidence _____ the existing theory.',
 '["contradicts", "opposes", "refutes", "denies"]', 2,
 '"Refutes" = disproves with evidence. The strongest/most precise academic term here.',
 '{"academic-vocab", "verbs", "argumentation"}'),

('vocab', 'B1', 'mcq',
 'The documentary had a _____ impact on public awareness.',
 '["significant", "big", "large", "major"]', 0,
 '"Significant impact" — most natural academic collocation. "Major" also works but "significant" is preferred.',
 '{"collocations", "adjectives", "academic-vocab"}'),

('vocab', 'B2', 'mcq',
 'She made a _____ effort to improve her pronunciation.',
 '["conscious", "careful", "deliberate", "intentional"]', 2,
 '"Deliberate effort" — natural collocation. "Deliberate" implies purposeful, sustained action.',
 '{"collocations", "adjectives"}'),

('vocab', 'C1', 'mcq',
 'The report _____ several flaws in the current system.',
 '["exposed", "revealed", "uncovered", "highlighted"]', 3,
 '"Highlighted flaws" — most common academic/report collocation. Others are valid but less frequent in this context.',
 '{"collocations", "academic-writing", "verbs"}');

-- Reading Questions (5)
insert into questions (skill, difficulty, type, prompt, passage, options, answer, explanation, tags) values
('reading', 'B2', 'reading',
 'According to the passage, what is the primary reason cities are investing in green spaces?',
 'Urban planners across the globe are increasingly recognising the multifaceted benefits of integrating green spaces into city designs. Beyond their aesthetic appeal, parks and urban forests serve as natural air purifiers, absorbing pollutants and releasing oxygen. Furthermore, research consistently demonstrates that access to nature significantly reduces stress levels and improves mental well-being among city dwellers. Economically, properties adjacent to parks command higher prices, contributing to increased tax revenues. However, the most compelling argument driving municipal investment is the role green spaces play in mitigating the urban heat island effect, thereby reducing energy consumption during peak summer months.',
 '["Aesthetic improvement of the cityscape", "Reducing energy costs by lowering urban temperatures", "Increasing property values near parks", "Improving air quality for residents"]',
 1,
 'The passage states the "most compelling argument" is mitigating the urban heat island effect and reducing energy consumption — making option B correct.',
 '{"reading-comprehension", "main-idea", "urban-planning"}'),

('reading', 'B2', 'reading',
 'What does the word "mitigating" (paragraph 1) most closely mean?',
 'Urban planners across the globe are increasingly recognising the multifaceted benefits of integrating green spaces into city designs. Beyond their aesthetic appeal, parks and urban forests serve as natural air purifiers, absorbing pollutants and releasing oxygen. Furthermore, research consistently demonstrates that access to nature significantly reduces stress levels and improves mental well-being among city dwellers. Economically, properties adjacent to parks command higher prices, contributing to increased tax revenues. However, the most compelling argument driving municipal investment is the role green spaces play in mitigating the urban heat island effect, thereby reducing energy consumption during peak summer months.',
 '["Eliminating", "Reducing the severity of", "Studying", "Causing"]',
 1,
 '"Mitigating" = making less severe/harmful. Not eliminating (too strong), not studying or causing.',
 '{"vocabulary-in-context", "reading"}'),

('reading', 'C1', 'reading',
 'Which statement best describes the author''s tone in this passage?',
 'The rhetoric surrounding artificial intelligence often oscillates between utopian enthusiasm and dystopian dread, rarely pausing for measured analysis. Proponents herald AI as the solution to humanity''s most intractable problems, from climate change to disease. Detractors, meanwhile, envision scenarios of mass unemployment and existential threat. Lost in this polarised discourse is a more nuanced reality: AI is a tool, powerful yet fundamentally shaped by the intentions and competencies of those who deploy it. Its consequences, therefore, are neither predetermined nor inevitable — they are a reflection of societal choices.',
 '["Enthusiastically supportive of AI development", "Deeply concerned about AI risks", "Balanced and analytical", "Dismissive of both optimists and pessimists"]',
 2,
 'Author critiques both extremes and calls for "measured analysis" and "nuanced reality" — balanced/analytical tone.',
 '{"tone", "author-purpose", "inference"}'),

('reading', 'B1', 'reading',
 'What can be inferred about students who take regular breaks while studying?',
 'A growing body of research challenges the popular notion that longer, uninterrupted study sessions lead to better academic outcomes. Studies indicate that the brain''s ability to retain new information diminishes significantly after sustained focus of more than 45 minutes. In contrast, students who incorporate short breaks — typically 10 to 15 minutes — every hour demonstrate markedly improved recall during assessments. These findings suggest that strategic rest is not a sign of laziness but rather an essential component of effective learning.',
 '["They are less disciplined than those who study without breaks", "They tend to perform better on tests", "They study for longer total hours", "They find studying easier"]',
 1,
 'Passage states students with breaks show "markedly improved recall during assessments" = perform better on tests.',
 '{"inference", "reading-comprehension", "study-skills"}'),

('reading', 'B2', 'reading',
 'Which title best captures the main idea of the passage?',
 'A growing body of research challenges the popular notion that longer, uninterrupted study sessions lead to better academic outcomes. Studies indicate that the brain''s ability to retain new information diminishes significantly after sustained focus of more than 45 minutes. In contrast, students who incorporate short breaks — typically 10 to 15 minutes — every hour demonstrate markedly improved recall during assessments. These findings suggest that strategic rest is not a sign of laziness but rather an essential component of effective learning.',
 '["Why Students Struggle to Focus", "The Science of Smarter Studying: Why Breaks Matter", "How to Study for Six Hours a Day", "Memory Loss and Academic Performance"]',
 1,
 'Main idea: strategic breaks improve learning outcomes. Option B captures both the science angle and the key finding.',
 '{"main-idea", "title-selection", "reading"}');

-- Listening Questions (5)
insert into questions (skill, difficulty, type, prompt, audio_text, options, answer, explanation, tags) values
('listening', 'B1', 'listening',
 'What is the main topic of the lecture excerpt?',
 'Good morning, everyone. Today we''re going to explore a concept that has transformed modern economics: the idea of opportunity cost. At its simplest, opportunity cost refers to the value of the next best alternative you give up when making a choice. For instance, if you spend Saturday studying, the opportunity cost might be the football match you could have attended. Understanding this concept helps us make more rational decisions, both in our personal lives and in national economic policy.',
 '["The history of modern economics", "Understanding opportunity cost in economics", "How to study effectively on weekends", "The importance of rational decision-making"]',
 1,
 'Speaker explicitly introduces "opportunity cost" as today''s topic and spends the excerpt defining it.',
 '{"listening-comprehension", "main-topic", "economics"}'),

('listening', 'B2', 'listening',
 'According to the speaker, what does "opportunity cost" mean?',
 'Good morning, everyone. Today we''re going to explore a concept that has transformed modern economics: the idea of opportunity cost. At its simplest, opportunity cost refers to the value of the next best alternative you give up when making a choice. For instance, if you spend Saturday studying, the opportunity cost might be the football match you could have attended. Understanding this concept helps us make more rational decisions, both in our personal lives and in national economic policy.',
 '["The total cost of all available alternatives", "The financial cost of making a wrong decision", "The value of the best alternative you forgo", "The time spent considering different options"]',
 2,
 'Speaker defines it as "the value of the next best alternative you give up when making a choice."',
 '{"listening-detail", "definition", "economics"}'),

('listening', 'B1', 'listening',
 'What example does the speaker use to illustrate opportunity cost?',
 'Good morning, everyone. Today we''re going to explore a concept that has transformed modern economics: the idea of opportunity cost. At its simplest, opportunity cost refers to the value of the next best alternative you give up when making a choice. For instance, if you spend Saturday studying, the opportunity cost might be the football match you could have attended. Understanding this concept helps us make more rational decisions, both in our personal lives and in national economic policy.',
 '["Choosing between two job offers", "Spending Saturday studying instead of watching a football match", "Making decisions about national economic policy", "Calculating the cost of university tuition"]',
 1,
 'Speaker gives this exact example: "if you spend Saturday studying, the opportunity cost might be the football match."',
 '{"listening-detail", "examples", "economics"}'),

('listening', 'B2', 'listening',
 'Listen and identify the speaker''s conclusion.',
 'To summarise our discussion on climate adaptation: cities cannot afford to wait for perfect solutions. The evidence overwhelmingly suggests that early investment in flood defences, heat-resistant infrastructure, and urban greening yields far greater long-term savings than reactive measures taken after a disaster. Municipalities that have already embraced proactive planning report not only reduced damage costs but also improved public health outcomes and increased investor confidence. The message is clear: act now, or pay significantly more later.',
 '["Cities should wait for better technology before investing in adaptation", "Proactive climate investment saves money and improves outcomes", "Flood defences are the most important adaptation measure", "Investors are currently avoiding climate-vulnerable cities"]',
 1,
 'Speaker''s conclusion: "act now, or pay significantly more later" — proactive investment yields better outcomes.',
 '{"listening-conclusion", "inference", "climate"}'),

('listening', 'C1', 'listening',
 'What is the speaker''s attitude toward reactive disaster measures?',
 'To summarise our discussion on climate adaptation: cities cannot afford to wait for perfect solutions. The evidence overwhelmingly suggests that early investment in flood defences, heat-resistant infrastructure, and urban greening yields far greater long-term savings than reactive measures taken after a disaster. Municipalities that have already embraced proactive planning report not only reduced damage costs but also improved public health outcomes and increased investor confidence. The message is clear: act now, or pay significantly more later.',
 '["Supportive — they are necessary in emergencies", "Neutral — both approaches have equal merit", "Critical — they are more costly than proactive measures", "Uncertain — more research is needed"]',
 2,
 'Speaker contrasts reactive measures unfavourably with proactive ones, implying reactive = costlier and less effective.',
 '{"speaker-attitude", "inference", "critical-listening"}');

-- Flashcards (15)
insert into flashcards (word, pos, definition, example, difficulty) values
('ubiquitous', 'adjective', 'Present, appearing, or found everywhere.', 'Smartphones have become ubiquitous in modern society.', 'C1'),
('mitigate', 'verb', 'To make less severe, serious, or painful.', 'Green roofs help mitigate the urban heat island effect.', 'B2'),
('eloquent', 'adjective', 'Fluent or persuasive in speaking or writing.', 'Her eloquent speech moved the entire audience.', 'B2'),
('pragmatic', 'adjective', 'Dealing with things sensibly and realistically.', 'We need a pragmatic approach to solving this crisis.', 'C1'),
('ambiguous', 'adjective', 'Open to more than one interpretation; unclear.', 'The contract contained several ambiguous clauses.', 'B2'),
('exemplify', 'verb', 'Be a typical example of; illustrate.', 'Her dedication exemplifies the spirit of the programme.', 'C1'),
('coherent', 'adjective', 'Logical and consistent; clearly expressed.', 'A coherent argument requires strong evidence.', 'B2'),
('innovative', 'adjective', 'Featuring new methods; advanced and original.', 'The company is known for its innovative products.', 'B1'),
('scrutinise', 'verb', 'Examine or inspect closely and thoroughly.', 'The committee scrutinised every line of the report.', 'C1'),
('inevitable', 'adjective', 'Certain to happen; unavoidable.', 'Change is inevitable in a fast-moving industry.', 'B2'),
('deteriorate', 'verb', 'Become progressively worse.', 'Air quality tends to deteriorate during rush hour.', 'B2'),
('proficient', 'adjective', 'Competent or skilled in doing something.', 'She became proficient in Spanish after two years of study.', 'B2'),
('contentious', 'adjective', 'Causing or likely to cause controversy.', 'Immigration policy remains a contentious issue.', 'C1'),
('deduce', 'verb', 'Arrive at a conclusion by reasoning from evidence.', 'From the data, we can deduce that sales are declining.', 'B2'),
('resilient', 'adjective', 'Able to withstand or recover quickly from difficulties.', 'Resilient communities bounce back faster after disasters.', 'B2');

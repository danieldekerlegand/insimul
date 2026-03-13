/**
 * Babylon Notice Board Panel
 *
 * In-game panel (N key) showing short articles in the target language.
 * Articles scale with player proficiency. Clicking words adds them
 * to vocabulary, and comprehension questions earn bonus XP.
 */

import * as GUI from '@babylonjs/gui';

export interface NoticeArticle {
  id: string;
  title: string;
  titleTranslation: string;
  body: string;
  bodyTranslation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabularyWords: { word: string; meaning: string }[];
  comprehensionQuestion?: {
    question: string;
    questionTranslation: string;
    options: string[];
    correctIndex: number;
  };
}

// Sample articles by difficulty (would be AI-generated in production)
export const SAMPLE_ARTICLES: NoticeArticle[] = [
  {
    id: 'notice_1',
    title: 'Le Marché du Village',
    titleTranslation: 'The Village Market',
    body: 'Le marché est ouvert tous les jours. Venez acheter du pain, du fromage, et des fruits frais.',
    bodyTranslation: 'The market is open every day. Come buy bread, cheese, and fresh fruits.',
    difficulty: 'beginner',
    vocabularyWords: [
      { word: 'marché', meaning: 'market' },
      { word: 'pain', meaning: 'bread' },
      { word: 'fromage', meaning: 'cheese' },
      { word: 'fruits', meaning: 'fruits' },
    ],
    comprehensionQuestion: {
      question: 'Quand est-ce que le marché est ouvert?',
      questionTranslation: 'When is the market open?',
      options: ['Le lundi', 'Tous les jours', 'Le weekend'],
      correctIndex: 1,
    },
  },
  {
    id: 'notice_2',
    title: 'Bienvenue aux Nouveaux Arrivants',
    titleTranslation: 'Welcome to Newcomers',
    body: 'Le conseil du village souhaite la bienvenue à tous les nouveaux habitants. Une réunion aura lieu demain soir à la mairie.',
    bodyTranslation: 'The village council welcomes all new inhabitants. A meeting will take place tomorrow evening at the town hall.',
    difficulty: 'intermediate',
    vocabularyWords: [
      { word: 'bienvenue', meaning: 'welcome' },
      { word: 'habitants', meaning: 'inhabitants' },
      { word: 'réunion', meaning: 'meeting' },
      { word: 'mairie', meaning: 'town hall' },
    ],
    comprehensionQuestion: {
      question: 'Où aura lieu la réunion?',
      questionTranslation: 'Where will the meeting take place?',
      options: ['Au marché', 'À la mairie', 'À l\'église'],
      correctIndex: 1,
    },
  },
  {
    id: 'notice_3',
    title: 'Avis Important: Travaux de Réparation',
    titleTranslation: 'Important Notice: Repair Work',
    body: 'En raison de travaux de réparation sur le pont principal, la circulation sera déviée par le chemin forestier pendant les deux prochaines semaines. Nous nous excusons pour la gêne occasionnée.',
    bodyTranslation: 'Due to repair work on the main bridge, traffic will be diverted through the forest path for the next two weeks. We apologize for the inconvenience.',
    difficulty: 'advanced',
    vocabularyWords: [
      { word: 'travaux', meaning: 'work/construction' },
      { word: 'pont', meaning: 'bridge' },
      { word: 'circulation', meaning: 'traffic' },
      { word: 'chemin', meaning: 'path' },
      { word: 'semaines', meaning: 'weeks' },
    ],
    comprehensionQuestion: {
      question: 'Combien de temps dureront les travaux?',
      questionTranslation: 'How long will the work last?',
      options: ['Un jour', 'Une semaine', 'Deux semaines'],
      correctIndex: 2,
    },
  },
];

export class BabylonNoticeBoardPanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private contentStack: GUI.StackPanel | null = null;
  private scrollViewer: GUI.ScrollViewer | null = null;
  private isVisible: boolean = false;

  private playerFluency: number = 0;
  private showTranslations: boolean = true;
  private articles: NoticeArticle[] = [];
  private answeredQuestions: Set<string> = new Set();

  private onClose: (() => void) | null = null;
  private onWordClicked: ((word: string, meaning: string) => void) | null = null;
  private onQuestionAnswered: ((correct: boolean, articleId: string) => void) | null = null;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.articles = [...SAMPLE_ARTICLES];
    this.createPanel();
  }

  private createPanel(): void {
    this.container = new GUI.Rectangle('noticeBoardContainer');
    this.container.width = '580px';
    this.container.height = '560px';
    this.container.cornerRadius = 10;
    this.container.color = '#c9a14a';
    this.container.thickness = 3;
    this.container.background = 'rgba(40, 30, 20, 0.95)';
    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.container.zIndex = 50;
    this.advancedTexture.addControl(this.container);

    // Title bar
    const titleBar = new GUI.Rectangle('noticeTitleBar');
    titleBar.width = '580px';
    titleBar.height = '50px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(80, 60, 30, 1)';
    titleBar.thickness = 0;
    titleBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.container.addControl(titleBar);

    const titleText = new GUI.TextBlock('noticeTitle');
    titleText.text = 'Notice Board';
    titleText.fontSize = 20;
    titleText.fontWeight = 'bold';
    titleText.color = '#f5e6c8';
    titleText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleText.top = '14px';
    this.container.addControl(titleText);

    // Close button
    const closeBtn = GUI.Button.CreateSimpleButton('noticeClose', 'X');
    closeBtn.width = '36px';
    closeBtn.height = '36px';
    closeBtn.color = 'white';
    closeBtn.background = 'rgba(200, 50, 50, 0.8)';
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 16;
    closeBtn.fontWeight = 'bold';
    closeBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    closeBtn.top = '7px';
    closeBtn.left = '-8px';
    closeBtn.onPointerUpObservable.add(() => {
      this.hide();
      this.onClose?.();
    });
    this.container.addControl(closeBtn);

    // Toggle translations button
    const toggleBtn = GUI.Button.CreateSimpleButton('noticeToggleTrans', 'Show/Hide Translations');
    toggleBtn.width = '160px';
    toggleBtn.height = '26px';
    toggleBtn.color = '#c9a14a';
    toggleBtn.background = 'rgba(60, 50, 30, 0.8)';
    toggleBtn.cornerRadius = 4;
    toggleBtn.fontSize = 11;
    toggleBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    toggleBtn.top = '56px';
    toggleBtn.left = '10px';
    toggleBtn.onPointerUpObservable.add(() => {
      this.showTranslations = !this.showTranslations;
      this.refreshContent();
    });
    this.container.addControl(toggleBtn);

    // Scroll area
    this.scrollViewer = new GUI.ScrollViewer('noticeScroll');
    this.scrollViewer.width = '560px';
    this.scrollViewer.height = '460px';
    this.scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.scrollViewer.top = '90px';
    this.scrollViewer.thickness = 0;
    this.scrollViewer.barColor = 'rgba(200, 160, 80, 0.8)';
    this.scrollViewer.barBackground = 'rgba(50, 40, 20, 0.5)';
    this.container.addControl(this.scrollViewer);

    this.contentStack = new GUI.StackPanel('noticeContent');
    this.contentStack.width = '540px';
    this.contentStack.spacing = 8;
    this.scrollViewer.addControl(this.contentStack);

    this.container.isVisible = false;
  }

  private getFilteredArticles(): NoticeArticle[] {
    // Filter by difficulty based on fluency
    return this.articles.filter(a => {
      if (a.difficulty === 'beginner') return true;
      if (a.difficulty === 'intermediate') return this.playerFluency >= 25;
      if (a.difficulty === 'advanced') return this.playerFluency >= 55;
      return true;
    });
  }

  private refreshContent(): void {
    if (!this.contentStack) return;

    const children = this.contentStack.children.slice();
    for (const child of children) {
      this.contentStack.removeControl(child);
      child.dispose();
    }

    const articles = this.getFilteredArticles();

    if (articles.length === 0) {
      const emptyText = new GUI.TextBlock('noticeEmpty');
      emptyText.text = 'No notices available yet.';
      emptyText.fontSize = 14;
      emptyText.color = 'rgba(200, 180, 140, 0.8)';
      emptyText.height = '40px';
      this.contentStack.addControl(emptyText);
      return;
    }

    for (const article of articles) {
      const card = this.createArticleCard(article);
      this.contentStack.addControl(card);
    }
  }

  private createArticleCard(article: NoticeArticle): GUI.Rectangle {
    const hasQuestion = article.comprehensionQuestion && !this.answeredQuestions.has(article.id);
    const bodyLines = Math.ceil(article.body.length / 55);
    const translationLines = this.showTranslations ? Math.ceil(article.bodyTranslation.length / 60) : 0;
    const vocabHeight = article.vocabularyWords.length > 0 ? 30 : 0;
    const questionHeight = hasQuestion ? 90 : 0;
    const cardHeight = 50 + bodyLines * 16 + translationLines * 14 + vocabHeight + questionHeight + 20;

    const card = new GUI.Rectangle(`article_${article.id}`);
    card.width = '530px';
    card.height = `${cardHeight}px`;
    card.cornerRadius = 6;
    card.thickness = 1;
    card.color = 'rgba(200, 160, 80, 0.4)';
    card.background = 'rgba(50, 40, 25, 0.8)';

    const diffColor = article.difficulty === 'beginner' ? '#6bbd5b' : (article.difficulty === 'intermediate' ? '#f39c12' : '#e74c3c');

    // Title
    const titleText = new GUI.TextBlock(`articleTitle_${article.id}`);
    titleText.text = article.title;
    titleText.fontSize = 15;
    titleText.fontWeight = 'bold';
    titleText.color = '#f5e6c8';
    titleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleText.left = '12px';
    titleText.top = '8px';
    titleText.height = '20px';
    card.addControl(titleText);

    // Difficulty badge
    const diffBadge = new GUI.Rectangle(`articleDiff_${article.id}`);
    diffBadge.width = '80px';
    diffBadge.height = '18px';
    diffBadge.cornerRadius = 9;
    diffBadge.background = `rgba(${diffColor === '#6bbd5b' ? '107,189,91' : (diffColor === '#f39c12' ? '243,156,18' : '231,76,60')}, 0.3)`;
    diffBadge.thickness = 0;
    diffBadge.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    diffBadge.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    diffBadge.top = '8px';
    diffBadge.left = '-12px';
    card.addControl(diffBadge);

    const diffText = new GUI.TextBlock(`articleDiffText_${article.id}`);
    diffText.text = article.difficulty;
    diffText.fontSize = 10;
    diffText.fontWeight = 'bold';
    diffText.color = diffColor;
    diffBadge.addControl(diffText);

    // Title translation
    if (this.showTranslations) {
      const titleTrans = new GUI.TextBlock(`articleTitleTrans_${article.id}`);
      titleTrans.text = `(${article.titleTranslation})`;
      titleTrans.fontSize = 11;
      titleTrans.color = 'rgba(180, 160, 120, 0.7)';
      titleTrans.fontStyle = 'italic';
      titleTrans.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      titleTrans.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      titleTrans.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      titleTrans.left = '12px';
      titleTrans.top = '28px';
      titleTrans.height = '16px';
      card.addControl(titleTrans);
    }

    // Body text
    let yOffset = this.showTranslations ? 48 : 34;
    const bodyText = new GUI.TextBlock(`articleBody_${article.id}`);
    bodyText.text = article.body;
    bodyText.fontSize = 13;
    bodyText.color = '#d0c4a8';
    bodyText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    bodyText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    bodyText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bodyText.left = '12px';
    bodyText.top = `${yOffset}px`;
    bodyText.height = `${bodyLines * 16 + 4}px`;
    bodyText.width = '510px';
    bodyText.textWrapping = true;
    card.addControl(bodyText);
    yOffset += bodyLines * 16 + 6;

    // Body translation
    if (this.showTranslations) {
      const bodyTrans = new GUI.TextBlock(`articleBodyTrans_${article.id}`);
      bodyTrans.text = article.bodyTranslation;
      bodyTrans.fontSize = 11;
      bodyTrans.color = 'rgba(160, 150, 120, 0.7)';
      bodyTrans.fontStyle = 'italic';
      bodyTrans.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      bodyTrans.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      bodyTrans.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      bodyTrans.left = '12px';
      bodyTrans.top = `${yOffset}px`;
      bodyTrans.height = `${translationLines * 14 + 4}px`;
      bodyTrans.width = '510px';
      bodyTrans.textWrapping = true;
      card.addControl(bodyTrans);
      yOffset += translationLines * 14 + 6;
    }

    // Vocabulary words as clickable badges
    if (article.vocabularyWords.length > 0) {
      const vocabRow = new GUI.Rectangle(`articleVocab_${article.id}`);
      vocabRow.width = '510px';
      vocabRow.height = '24px';
      vocabRow.thickness = 0;
      vocabRow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      vocabRow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      vocabRow.left = '12px';
      vocabRow.top = `${yOffset}px`;
      card.addControl(vocabRow);

      let xOff = 0;
      for (const vw of article.vocabularyWords) {
        const wordBtn = GUI.Button.CreateSimpleButton(`vocabBtn_${article.id}_${vw.word}`, vw.word);
        wordBtn.width = `${Math.max(50, vw.word.length * 8 + 16)}px`;
        wordBtn.height = '22px';
        wordBtn.fontSize = 10;
        wordBtn.color = '#c9a14a';
        wordBtn.background = 'rgba(100, 80, 40, 0.5)';
        wordBtn.cornerRadius = 11;
        wordBtn.thickness = 1;
        wordBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        wordBtn.left = `${xOff}px`;
        wordBtn.onPointerUpObservable.add(() => {
          this.onWordClicked?.(vw.word, vw.meaning);
        });
        vocabRow.addControl(wordBtn);
        xOff += Math.max(50, vw.word.length * 8 + 16) + 4;
      }
      yOffset += 28;
    }

    // Comprehension question
    if (hasQuestion && article.comprehensionQuestion) {
      const q = article.comprehensionQuestion;

      const qText = new GUI.TextBlock(`articleQ_${article.id}`);
      qText.text = this.showTranslations ? `${q.question} (${q.questionTranslation})` : q.question;
      qText.fontSize = 12;
      qText.fontWeight = 'bold';
      qText.color = '#e8d8b0';
      qText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      qText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      qText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      qText.left = '12px';
      qText.top = `${yOffset + 4}px`;
      qText.height = '18px';
      qText.width = '510px';
      qText.textWrapping = true;
      card.addControl(qText);

      let optXOff = 0;
      const optRow = new GUI.Rectangle(`articleOpts_${article.id}`);
      optRow.width = '510px';
      optRow.height = '28px';
      optRow.thickness = 0;
      optRow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      optRow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      optRow.left = '12px';
      optRow.top = `${yOffset + 26}px`;
      card.addControl(optRow);

      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        const optBtn = GUI.Button.CreateSimpleButton(`optBtn_${article.id}_${i}`, opt);
        optBtn.width = `${Math.max(80, opt.length * 8 + 20)}px`;
        optBtn.height = '24px';
        optBtn.fontSize = 11;
        optBtn.color = 'white';
        optBtn.background = 'rgba(60, 80, 60, 0.6)';
        optBtn.cornerRadius = 4;
        optBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        optBtn.left = `${optXOff}px`;
        const isCorrect = i === q.correctIndex;
        optBtn.onPointerUpObservable.add(() => {
          this.answeredQuestions.add(article.id);
          this.onQuestionAnswered?.(isCorrect, article.id);
          this.refreshContent();
        });
        optRow.addControl(optBtn);
        optXOff += Math.max(80, opt.length * 8 + 20) + 6;
      }
    }

    return card;
  }

  // --- Public API ---

  public setPlayerFluency(fluency: number): void {
    this.playerFluency = fluency;
  }

  public setArticles(articles: NoticeArticle[]): void {
    this.articles = articles;
    if (this.isVisible) this.refreshContent();
  }

  public addArticle(article: NoticeArticle): void {
    this.articles.push(article);
    if (this.isVisible) this.refreshContent();
  }

  public show(): void {
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
      this.refreshContent();
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
    }
  }

  public toggle(): void {
    if (this.isVisible) this.hide(); else this.show();
  }

  public getIsVisible(): boolean { return this.isVisible; }

  public setOnClose(cb: () => void): void { this.onClose = cb; }
  public setOnWordClicked(cb: (word: string, meaning: string) => void): void { this.onWordClicked = cb; }
  public setOnQuestionAnswered(cb: (correct: boolean, articleId: string) => void): void { this.onQuestionAnswered = cb; }

  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }
  }
}

// 外国新闻事业史复习应用 - 公共JS
// 包含：导航高亮、localStorage数据管理、通用工具函数

// ===== 导航HTML（每个页面引入） =====
const NAV_HTML = `
<nav class="navbar">
  <a href="index.html" class="navbar-brand">
    <span class="icon">📰</span>
    <span>外国新闻事业史 · 复习助手</span>
  </a>
  <ul class="navbar-menu">
    <li><a href="index.html" data-page="index">🏠 首页</a></li>
    <li><a href="today.html" data-page="today">📋 今日任务</a></li>
    <li><a href="calendar.html" data-page="calendar">📅 复习日历</a></li>
    <li><a href="materials.html" data-page="materials">📖 背诵资料</a></li>
    <li><a href="keypoints.html" data-page="keypoints">⭐ 核心考点</a></li>
    <li><a href="quiz.html" data-page="quiz">✍️ 题库练习</a></li>
    <li><a href="exam.html" data-page="exam">📝 模拟考试</a></li>
    <li><a href="mistakes.html" data-page="mistakes">❌ 错题本</a></li>
  </ul>
</nav>`;

const FOOTER_HTML = `
<div class="footer">
  外国新闻事业史复习助手 · 考试日期：2026年10月25日 · 共42天复习计划
</div>`;

// 页面加载时注入导航和页脚
document.addEventListener('DOMContentLoaded', function() {
  // 注入导航
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (navPlaceholder) {
    navPlaceholder.outerHTML = NAV_HTML;
  }
  // 注入页脚
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = FOOTER_HTML;
  }
  // 高亮当前页面
  const currentPage = document.body.getAttribute('data-page');
  if (currentPage) {
    document.querySelectorAll('.navbar-menu a').forEach(a => {
      if (a.getAttribute('data-page') === currentPage) {
        a.classList.add('active');
      }
    });
  }
});

// ===== localStorage 数据管理 =====
const Store = {
  PREFIX: 'news_history_',

  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(this.PREFIX + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  // 复习计划完成状态
  getPlanProgress() {
    return this.get('plan_progress', {});
  },

  setDayCompleted(day, completed) {
    const progress = this.getPlanProgress();
    progress[day] = completed;
    this.set('plan_progress', progress);
  },

  isDayCompleted(day) {
    const progress = this.getPlanProgress();
    return !!progress[day];
  },

  // 背诵资料已掌握标记
  getMasteredMaterials() {
    return this.get('mastered_materials', {});
  },

  toggleMaterialMastered(category, index) {
    const mastered = this.getMasteredMaterials();
    const key = category + '_' + index;
    mastered[key] = !mastered[key];
    this.set('mastered_materials', mastered);
    return mastered[key];
  },

  isMaterialMastered(category, index) {
    const mastered = this.getMasteredMaterials();
    return !!mastered[category + '_' + index];
  },

  // 题库答题记录
  getQuizRecords() {
    return this.get('quiz_records', {});
  },

  setQuizRecord(type, id, record) {
    const records = this.getQuizRecords();
    const key = type + '_' + id;
    records[key] = record;
    this.set('quiz_records', records);
  },

  getQuizRecord(type, id) {
    const records = this.getQuizRecords();
    return records[type + '_' + id] || null;
  },

  // 错题本
  getMistakes() {
    return this.get('mistakes', []);
  },

  addMistake(mistake) {
    const mistakes = this.getMistakes();
    // 去重
    const exists = mistakes.find(m => m.type === mistake.type && m.id === mistake.id);
    if (!exists) {
      mistake.addedAt = new Date().toISOString();
      mistake.reviewed = false;
      mistakes.push(mistake);
      this.set('mistakes', mistakes);
    }
    return mistakes;
  },

  removeMistake(type, id) {
    let mistakes = this.getMistakes();
    mistakes = mistakes.filter(m => !(m.type === mistake.type && m.id === mistake.id));
    this.set('mistakes', mistakes);
    return mistakes;
  },

  markMistakeReviewed(type, id) {
    const mistakes = this.getMistakes();
    const m = mistakes.find(m => m.type === type && m.id === id);
    if (m) {
      m.reviewed = !m.reviewed;
      this.set('mistakes', mistakes);
    }
    return mistakes;
  },

  clearMistakes() {
    this.set('mistakes', []);
  },

  // 模拟考试记录
  getExamRecords() {
    return this.get('exam_records', []);
  },

  addExamRecord(record) {
    const records = this.getExamRecords();
    record.id = Date.now();
    record.date = new Date().toISOString();
    records.push(record);
    this.set('exam_records', records);
    return records;
  },

  // 重置所有数据
  resetAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
};

// ===== 通用工具函数 =====
const Utils = {
  // 计算距离考试的天数
  daysUntilExam() {
    const exam = new Date('2026-10-25');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    return Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
  },

  // 获取当前是第几天（从9月13日开始）
  getCurrentDay() {
    const start = new Date('2026-09-13');
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const day = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(42, day));
  },

  // 获取今日计划
  getTodayPlan() {
    const day = this.getCurrentDay();
    if (APP_DATA && APP_DATA.plan) {
      return APP_DATA.plan[day - 1] || null;
    }
    return null;
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // 随机打乱数组
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // 从数组中随机取n个
  sample(array, n) {
    return this.shuffle(array).slice(0, n);
  },

  // 转义HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 显示提示消息
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      padding: 12px 24px; border-radius: 8px; color: white; font-size: 14px;
      font-weight: 600; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: opacity 0.3s; opacity: 0;
    `;
    const colors = { info: '#2F5496', success: '#70AD47', warning: '#FFC000', danger: '#C00000' };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  // 确认对话框
  confirm(message) {
    return window.confirm(message);
  }
};

// 题型中文映射
const QUESTION_TYPE_MAP = {
  single: '单选题',
  multiple: '多选题',
  term: '名词解释',
  short: '简答题',
  essay: '论述题'
};

// 阶段颜色映射
const PHASE_CLASS = {
  '基础梳理': 'phase1',
  '强化刷题': 'phase2',
  '模考冲刺': 'phase3',
  '考前调整': 'phase4'
};

const missionData = {
  daily: [
    {
      id: "d-run",
      title: "晚间校园跑",
      meta: "操场 3 公里 · 20 分钟 · 可与好友同跑",
      reward: "+60 XP",
      xp: 60,
      coins: 12,
      energy: 8,
      done: false,
    },
    {
      id: "d-stretch",
      title: "课后拉伸",
      meta: "宿舍 8 分钟 · 缓解久坐 · 低强度",
      reward: "+25 XP",
      xp: 25,
      coins: 6,
      energy: 4,
      done: true,
    },
    {
      id: "d-core",
      title: "核心力量入门",
      meta: "平板支撑 3 组 · 自动记录训练时长",
      reward: "+45 XP",
      xp: 45,
      coins: 10,
      energy: 6,
      done: false,
    },
  ],
  squad: [
    {
      id: "s-relay",
      title: "寝室接力 10 公里",
      meta: "4 人累计 · 每人至少 1 公里 · 人均计分",
      reward: "+90 XP",
      xp: 90,
      coins: 18,
      energy: 14,
      done: false,
    },
    {
      id: "s-buddy",
      title: "队友补位",
      meta: "邀请 1 位低活跃队友完成轻任务",
      reward: "+50 XP",
      xp: 50,
      coins: 12,
      energy: 10,
      done: false,
    },
    {
      id: "s-class",
      title: "班级热力榜",
      meta: "全班累计 30 次打卡 · 今日还差 6 次",
      reward: "+35 XP",
      xp: 35,
      coins: 8,
      energy: 8,
      done: false,
    },
  ],
  exam: [
    {
      id: "e-walk",
      title: "图书馆散步圈",
      meta: "饭后 12 分钟 · 低压力 · 不影响复习",
      reward: "+30 XP",
      xp: 30,
      coins: 8,
      energy: 5,
      done: false,
    },
    {
      id: "e-neck",
      title: "肩颈放松",
      meta: "睡前 6 分钟 · 久坐恢复 · 可补连续打卡",
      reward: "+20 XP",
      xp: 20,
      coins: 5,
      energy: 4,
      done: false,
    },
    {
      id: "e-breath",
      title: "减压呼吸训练",
      meta: "宿舍 5 分钟 · 情绪恢复 · 考试周限定",
      reward: "+15 XP",
      xp: 15,
      coins: 4,
      energy: 3,
      done: false,
    },
  ],
};

const badges = [
  { name: "首跑点火", icon: "flame", progress: 1, total: 1, color: "#ef684f" },
  { name: "夜跑领航员", icon: "moon-star", progress: 3, total: 5, color: "#2f7fa5" },
  { name: "寝室 MVP", icon: "trophy", progress: 7, total: 10, color: "#f1b842" },
  { name: "稳定节拍", icon: "calendar-check", progress: 11, total: 14, color: "#1f7a4d" },
  { name: "体测冲刺", icon: "timer", progress: 4, total: 8, color: "#6b6f2a" },
  { name: "队友助攻", icon: "handshake", progress: 2, total: 6, color: "#9c5a42" },
];

const leaderboard = [
  { rank: 1, name: "南区 2 栋 408", energy: 92 },
  { rank: 2, name: "经管 2301 战队", energy: 81 },
  { rank: 3, name: "我们宿舍都能跑", energy: 68, current: true },
  { rank: 4, name: "羽协晨练组", energy: 64 },
];

const defaults = {
  xp: 1260,
  coins: 240,
  streak: 11,
  weekly: 68,
  teamEnergy: 68,
  mode: "daily",
  completed: Object.fromEntries(
    Object.values(missionData)
      .flat()
      .map((mission) => [mission.id, mission.done]),
  ),
};

const storageKey = "gamefit-campus-state";
let state = loadState();
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const fresh = JSON.parse(JSON.stringify(defaults));
    return saved
      ? { ...fresh, ...saved, completed: { ...fresh.completed, ...(saved.completed || {}) } }
      : fresh;
  } catch {
    return JSON.parse(JSON.stringify(defaults));
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderMissions() {
  const list = document.querySelector("#missionList");
  const missions = missionData[state.mode];

  document.querySelectorAll("[data-mission-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.missionMode === state.mode);
  });

  list.innerHTML = missions
    .map((mission) => {
      const completed = Boolean(state.completed[mission.id]);
      return `
        <article class="mission-item ${completed ? "completed" : ""}">
          <button class="check-button" type="button" data-mission-id="${mission.id}" title="${completed ? "取消完成" : "完成任务"}">
            <i data-lucide="${completed ? "check" : "plus"}"></i>
          </button>
          <div>
            <strong class="mission-title">${mission.title}</strong>
            <span class="mission-meta">${mission.meta}</span>
          </div>
          <span class="reward-chip">${mission.reward}</span>
        </article>
      `;
    })
    .join("");

  updateIcons();
}

function renderLeaderboard() {
  const board = document.querySelector("#leaderboard");
  board.innerHTML = leaderboard
    .map(
      (team) => `
        <div class="leader-row ${team.current ? "current" : ""}">
          <span>${team.rank}</span>
          <strong>${team.name}</strong>
          <em>${team.current ? state.teamEnergy : team.energy}</em>
        </div>
      `,
    )
    .join("");
}

function renderBadges() {
  const grid = document.querySelector("#badgeGrid");
  grid.innerHTML = badges
    .map((badge) => {
      const ratio = Math.min(100, Math.round((badge.progress / badge.total) * 100));
      return `
        <article class="badge-card">
          <div class="badge-medal" style="background: ${badge.color}">
            <i data-lucide="${badge.icon}"></i>
          </div>
          <strong>${badge.name}</strong>
          <span>${badge.progress} / ${badge.total}</span>
          <div class="badge-progress"><i style="width: ${ratio}%"></i></div>
        </article>
      `;
    })
    .join("");
  updateIcons();
}

function updateStats() {
  const progressBase = 960;
  const levelSize = 400;
  const rawProgress = ((state.xp - progressBase) % levelSize) / levelSize;
  const xpProgress = Math.max(0, Math.round(rawProgress * 100));
  const level = 7 + Math.floor(Math.max(0, state.xp - progressBase) / levelSize);

  document.querySelector("#levelChip").textContent = `Lv. ${level}`;
  document.querySelector("#xpValue").textContent = String(state.xp);
  document.querySelector("#coinValue").textContent = String(state.coins);
  document.querySelector("#streakValue").textContent = `${state.streak} 天`;
  document.querySelector("#weeklyRate").textContent = `${state.weekly}%`;
  document.querySelector("#xpPercent").textContent = `${xpProgress}%`;
  document.querySelector("#xpRing").style.setProperty("--xp-progress", `${xpProgress}%`);
  document.querySelector("#teamEnergyBar").style.width = `${Math.min(100, state.teamEnergy)}%`;
  document.querySelector("#teamEnergyText").textContent = `${state.teamEnergy} / 100`;
  renderLeaderboard();
}

function findMission(id) {
  return Object.values(missionData)
    .flat()
    .find((mission) => mission.id === id);
}

function toggleMission(id) {
  const mission = findMission(id);
  if (!mission) return;

  const wasCompleted = Boolean(state.completed[id]);
  const direction = wasCompleted ? -1 : 1;
  state.completed[id] = !wasCompleted;
  state.xp = Math.max(0, state.xp + mission.xp * direction);
  state.coins = Math.max(0, state.coins + mission.coins * direction);
  state.teamEnergy = Math.max(0, Math.min(100, state.teamEnergy + mission.energy * direction));
  state.weekly = Math.max(0, Math.min(100, state.weekly + 4 * direction));
  state.streak = Math.max(0, state.streak + (wasCompleted ? 0 : 1));

  saveState();
  renderMissions();
  updateStats();
  showToast(wasCompleted ? "已撤销本次完成记录" : `${mission.title} 已完成，战队能量上升`);
}

function bindNavigation() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${view}`).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function bindMissionModes() {
  document.querySelectorAll("[data-mission-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.missionMode;
      document.querySelectorAll("[data-mission-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      saveState();
      renderMissions();
    });
  });
}

function bindActions() {
  document.querySelector("#missionList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mission-id]");
    if (button) toggleMission(button.dataset.missionId);
  });

  document.querySelector("#mockSync").addEventListener("click", () => {
    state.xp += 35;
    state.coins += 8;
    state.weekly = Math.min(100, state.weekly + 3);
    state.teamEnergy = Math.min(100, state.teamEnergy + 5);
    saveState();
    updateStats();
    showToast("已同步 18 分钟快走，获得 35 XP");
  });

  document.querySelector("#redeemReward").addEventListener("click", () => {
    if (state.coins < 120) {
      showToast("能量币不足，完成组队任务更快获得奖励");
      return;
    }
    state.coins -= 120;
    saveState();
    updateStats();
    showToast("已兑换校园轻食券，奖励保留在账户中");
  });

  document.querySelector("#inviteTeam").addEventListener("click", () => {
    showToast("已生成战队邀请卡，可发送给室友或班级群");
  });

  document.querySelectorAll(".route-node").forEach((node) => {
    node.addEventListener("click", () => {
      showToast(`${node.textContent}日挑战：完成当日轻任务即可点亮`);
    });
  });

  document.addEventListener("click", (event) => {
    const toastButton = event.target.closest("[data-toast]");
    if (!toastButton) return;

    if (toastButton.classList.contains("state-chip")) {
      document.querySelectorAll(".state-chip").forEach((button) => button.classList.remove("active"));
      toastButton.classList.add("active");
    }

    showToast(toastButton.dataset.toast);
  });
}

function bindTheme() {
  const savedTheme = localStorage.getItem("gamefit-campus-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  document.querySelector("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("gamefit-campus-theme", document.body.classList.contains("dark") ? "dark" : "light");
    showToast(document.body.classList.contains("dark") ? "已切换为深色模式" : "已切换为浅色模式");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindMissionModes();
  bindActions();
  bindTheme();
  renderMissions();
  renderBadges();
  updateStats();
  updateIcons();
});

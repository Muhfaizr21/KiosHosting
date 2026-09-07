// ponytail: localStorage buat demo frontend saja. Ganti backend API saat production.
const USERS_KEY = "kios_users";
const SESSION_KEY = "kios_session";

const seedUsers = [
  {
    name: "Admin Utama",
    email: "admin@kioshosting.id",
    password: "admin123",
    role: "superadmin",
  },
  {
    name: "Budi Santoso",
    email: "budi@gmail.com",
    password: "user1234",
    role: "user",
  },
];

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function seedAuth() {
  if (localStorage.getItem(USERS_KEY)) return getUsers();
  saveUsers(seedUsers);
  return seedUsers;
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function login(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { error: "Email atau kata sandi salah." };
  const session = { email: user.email, name: user.name, role: user.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function register({ name, email, password }) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) return { error: "Email sudah terdaftar." };
  const user = { name: name.trim(), email, password, role: "user" };
  saveUsers([...users, user]);
  const session = { email, name: user.name, role: "user" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

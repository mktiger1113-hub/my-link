import { db, isFirebaseConfigured } from "./firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  orderBy,
  increment,
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
}

export interface UserLink {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  clickCount: number;
}

// LocalStorage Helper for Client-side Mocking
const getMockData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setMockData = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ----------------------------------------------------
// Core DB Operations
// ----------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        displayName: data.displayName || "",
        username: data.username || "",
        bio: data.bio || "",
      };
    }
    return null;
  } else {
    // Mock Mode
    const users = getMockData<Record<string, Omit<UserProfile, "uid">>>("mylink_users", {});
    if (users[uid]) {
      return {
        uid,
        ...users[uid],
      };
    }
    return null;
  }
}

export async function getUserByDisplayName(displayName: string): Promise<UserProfile | null> {
  const cleanName = displayName.toLowerCase().trim();
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "users"), where("displayName", "==", cleanName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        displayName: data.displayName || "",
        username: data.username || "",
        bio: data.bio || "",
      };
    }
    return null;
  } else {
    // Mock Mode
    const users = getMockData<Record<string, Omit<UserProfile, "uid">>>("mylink_users", {});
    const foundUid = Object.keys(users).find(
      (uid) => users[uid].displayName.toLowerCase() === cleanName
    );
    if (foundUid) {
      return {
        uid: foundUid,
        ...users[foundUid],
      };
    }
    return null;
  }
}

export async function createUserProfile(
  uid: string,
  profile: { displayName: string; username: string; bio: string }
): Promise<void> {
  const cleanProfile = {
    displayName: profile.displayName.toLowerCase().trim(),
    username: profile.username,
    bio: profile.bio,
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, "users", uid), cleanProfile, { merge: true });
  } else {
    // Mock Mode
    const users = getMockData<Record<string, Omit<UserProfile, "uid">>>("mylink_users", {});
    users[uid] = cleanProfile;
    setMockData("mylink_users", users);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid">>
): Promise<void> {
  const cleanUpdates = { ...updates };
  if (cleanUpdates.displayName) {
    cleanUpdates.displayName = cleanUpdates.displayName.toLowerCase().trim();
  }

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, "users", uid), cleanUpdates);
  } else {
    // Mock Mode
    const users = getMockData<Record<string, Omit<UserProfile, "uid">>>("mylink_users", {});
    if (users[uid]) {
      users[uid] = { ...users[uid], ...cleanUpdates };
      setMockData("mylink_users", users);
    }
  }
}

export async function checkDisplayNameExists(
  displayName: string,
  excludeUid?: string
): Promise<boolean> {
  const cleanName = displayName.toLowerCase().trim();
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "users"), where("displayName", "==", cleanName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return false;
    if (excludeUid) {
      // Exclude current user uid from check (if they are just editing their name back to original)
      return querySnapshot.docs.some((doc) => doc.id !== excludeUid);
    }
    return true;
  } else {
    // Mock Mode
    const users = getMockData<Record<string, Omit<UserProfile, "uid">>>("mylink_users", {});
    return Object.keys(users).some(
      (uid) => users[uid].displayName.toLowerCase() === cleanName && uid !== excludeUid
    );
  }
}

export async function getLinks(uid: string): Promise<UserLink[]> {
  if (isFirebaseConfigured && db) {
    const linksRef = collection(db, "users", uid, "links");
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || "",
        url: data.url || "",
        createdAt: data.createdAt || Date.now(),
        clickCount: data.clickCount || 0,
      };
    });
  } else {
    // Mock Mode
    const allLinks = getMockData<Record<string, UserLink[]>>("mylink_links", {});
    const userLinks = allLinks[uid] || [];
    return [...userLinks].sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function addLink(uid: string, title: string, url: string): Promise<UserLink> {
  const newLinkData = {
    title,
    url,
    createdAt: Date.now(),
    clickCount: 0,
  };

  if (isFirebaseConfigured && db) {
    const linksRef = collection(db, "users", uid, "links");
    const docRef = await addDoc(linksRef, newLinkData);
    return {
      id: docRef.id,
      ...newLinkData,
    };
  } else {
    // Mock Mode
    const allLinks = getMockData<Record<string, UserLink[]>>("mylink_links", {});
    if (!allLinks[uid]) allLinks[uid] = [];
    const newLink: UserLink = {
      id: Math.random().toString(36).substring(2, 9),
      ...newLinkData,
    };
    allLinks[uid].push(newLink);
    setMockData("mylink_links", allLinks);
    return newLink;
  }
}

export async function updateLink(
  uid: string,
  linkId: string,
  updates: Partial<Omit<UserLink, "id" | "createdAt">>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    const linkDocRef = doc(db, "users", uid, "links", linkId);
    await updateDoc(linkDocRef, updates);
  } else {
    // Mock Mode
    const allLinks = getMockData<Record<string, UserLink[]>>("mylink_links", {});
    const userLinks = allLinks[uid] || [];
    const linkIndex = userLinks.findIndex((l) => l.id === linkId);
    if (linkIndex !== -1) {
      userLinks[linkIndex] = { ...userLinks[linkIndex], ...updates };
      allLinks[uid] = userLinks;
      setMockData("mylink_links", allLinks);
    }
  }
}

export async function deleteLink(uid: string, linkId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const linkDocRef = doc(db, "users", uid, "links", linkId);
    await deleteDoc(linkDocRef);
  } else {
    // Mock Mode
    const allLinks = getMockData<Record<string, UserLink[]>>("mylink_links", {});
    const userLinks = allLinks[uid] || [];
    const filtered = userLinks.filter((l) => l.id !== linkId);
    allLinks[uid] = filtered;
    setMockData("mylink_links", allLinks);
  }
}

export async function incrementClickCount(uid: string, linkId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const linkDocRef = doc(db, "users", uid, "links", linkId);
    await updateDoc(linkDocRef, {
      clickCount: increment(1),
    });
  } else {
    // Mock Mode
    const allLinks = getMockData<Record<string, UserLink[]>>("mylink_links", {});
    const userLinks = allLinks[uid] || [];
    const linkIndex = userLinks.findIndex((l) => l.id === linkId);
    if (linkIndex !== -1) {
      userLinks[linkIndex].clickCount = (userLinks[linkIndex].clickCount || 0) + 1;
      allLinks[uid] = userLinks;
      setMockData("mylink_links", allLinks);
    }
  }
}

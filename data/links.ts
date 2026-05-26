import { UserLink } from "@/lib/db";

export const dummyLinks: UserLink[] = [
  {
    id: "dummy-1",
    title: "인스타그램",
    url: "https://www.instagram.com",
    createdAt: Date.now() - 5000,
    clickCount: 15,
  },
  {
    id: "dummy-2",
    title: "유튜브",
    url: "https://www.youtube.com",
    createdAt: Date.now() - 4000,
    clickCount: 42,
  },
  {
    id: "dummy-3",
    title: "개인 블로그",
    url: "https://velog.io",
    createdAt: Date.now() - 3000,
    clickCount: 8,
  },
  {
    id: "dummy-4",
    title: "GitHub 저장소",
    url: "https://github.com",
    createdAt: Date.now() - 2000,
    clickCount: 29,
  },
  {
    id: "dummy-5",
    title: "포트폴리오",
    url: "https://my-portfolio.com",
    createdAt: Date.now() - 1000,
    clickCount: 5,
  },
];

'use client';

const firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Ethan',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
    'Kyle',
    'Liam',
    'Mia',
    'Noah',
    'Olivia',
    'Peter',
    'Quinn',
    'Ryan',
    'Sophia',
    'Thomas',
    'Ursula',
    'Victor',
    'Willow',
    'Xavier',
    'Yara',
    'Zane',
];
const lastNames = [
    'Smith',
    'Jones',
    'Williams',
    'Brown',
    'Davis',
    'Miller',
    'Wilson',
    'Moore',
    'Taylor',
    'Anderson',
    'Thomas',
    'Jackson',
    'White',
    'Harris',
    'Martin',
    'Thompson',
    'Garcia',
    'Martinez',
    'Robinson',
    'Clark',
];
const domains = ['example.com', 'mail.net', 'web.org', 'sample.co', 'demo.io'];
const sampleWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateUUID = (): string => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const generateFirstName = (): string => getRandomElement(firstNames);
export const generateLastName = (): string => getRandomElement(lastNames);
export const generateFullName = (): string => `${generateFirstName()} ${generateLastName()}`;
export const generateEmail = (): string =>
    `${generateFirstName().toLowerCase()}.${generateLastName().toLowerCase()}@${getRandomElement(domains)}`;
export const generateRandomNumber = (min: number = 0, max: number = 1000): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;
export const generateRandomBoolean = (): boolean => Math.random() > 0.5;
export const generateRandomWords = (count: number = 5): string =>
    Array.from({ length: count }, () => getRandomElement(sampleWords)).join(' ');
export const generateImageUrl = (width: number = 300, height: number = 200): string =>
    `https://via.placeholder.com/${width}x${height}/${Math.random().toString(16).slice(2, 8)}/FFFFFF?text=Image`; // Random color hex
export const generateRandomDate = (start = new Date(2000, 0, 1), end = new Date()): Date =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// src/utils/idGenerator.js

/**
 * Gets the current year (YY) and month (MM)
 * @returns {string} YYMM format string
 */
const getYYMM = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
};

/**
 * Generates a unique 10-digit Student ID: YYMM + 6-digit auto-increment sequence
 * Example: 2602000015
 * @returns {string} Unique Student ID
 */
export const generateStudentId = () => {
    const prefix = getYYMM();
    const sequenceKey = `student_sequence_${prefix}`;

    // Get current sequence for this month, or start at 0
    let currentSequence = parseInt(localStorage.getItem(sequenceKey) || '0', 10);

    // Increment sequence
    currentSequence++;

    // Save new sequence
    localStorage.setItem(sequenceKey, currentSequence.toString());

    // Format to 6 digits (e.g., 000015)
    const sequenceString = currentSequence.toString().padStart(6, '0');

    return `${prefix}${sequenceString}`;
};

/**
 * Previews the next available Student ID without incrementing the internal counter
 * Example: 2602000016
 * @returns {string} Expected Student ID
 */
export const previewStudentId = () => {
    const prefix = getYYMM();
    const sequenceKey = `student_sequence_${prefix}`;
    let currentSequence = parseInt(localStorage.getItem(sequenceKey) || '0', 10);
    currentSequence++; // We only look forward, we don't save
    const sequenceString = currentSequence.toString().padStart(6, '0');
    return `${prefix}${sequenceString}`;
};

/**
 * Extracts 2 letters based on the name rules:
 * 1. Middle name initials
 * 2. If no middle name, first letter of first name and first letter of last name
 * 3. Fallbacks if needed to ensure 2 letters
 * @param {string} fullName 
 * @returns {string} 2 uppercase letters
 */
const extractInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'XX';

    const parts = fullName.trim().toUpperCase().split(/\s+/);

    // If only one word provided (e.g. "John")
    if (parts.length === 1) {
        const word = parts[0];
        if (word.length >= 2) return word.substring(0, 2);
        return (word + 'XX').substring(0, 2);
    }

    // If three or more words (e.g. "John Doe Smith") -> focus on middle name "Doe"
    if (parts.length >= 3) {
        const middleName = parts[1];
        if (middleName.length >= 2) return middleName.substring(0, 2);
        return (middleName + 'XX').substring(0, 2);
    }

    // If exactly two words (e.g. "John Smith") -> First letter of each
    return (parts[0][0] + parts[1][0]);
};

/**
 * Helper to generate next available letter pair linearly 
 * E.g., AA, AB, AC ... ZZ
 */
const getNextLetterPair = (currentPair) => {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let char1 = currentPair[0];
    let char2 = currentPair[1];

    let i2 = ALPHABET.indexOf(char2);
    if (i2 < 25) {
        return char1 + ALPHABET[i2 + 1];
    }

    let i1 = ALPHABET.indexOf(char1);
    if (i1 < 25) {
        return ALPHABET[i1 + 1] + 'A';
    }

    // Should never really hit this unless there are 26*26=676 duplicate mentors in the SAME month
    return 'XX';
};

/**
 * Generates a unique 6-character Mentor ID: MEN + YYMM + 2 letters
 * @param {string} fullName 
 * @returns {string} Unique Mentor ID
 */
export const generateMentorId = (fullName) => {
    const prefix = getYYMM();
    let baseInitials = extractInitials(fullName);

    const existingMentorIdsKey = `mentor_ids_${prefix}`;
    // Store existing IDs as an array of 2-letter suffixes in localStorage
    let existingSuffixes = JSON.parse(localStorage.getItem(existingMentorIdsKey) || '[]');

    let finalInitials = baseInitials;

    // If these exact initials already exist this month, increment them until unique
    while (existingSuffixes.includes(finalInitials)) {
        finalInitials = getNextLetterPair(finalInitials);
    }

    existingSuffixes.push(finalInitials);
    localStorage.setItem(existingMentorIdsKey, JSON.stringify(existingSuffixes));

    return `MEN${prefix}${finalInitials}`;
};

/**
 * Previews the expected Mentor ID without saving to localStorage
 * @param {string} fullName 
 * @returns {string} Expected Mentor ID
 */
export const previewMentorId = (fullName) => {
    const prefix = getYYMM();
    let baseInitials = extractInitials(fullName);

    const existingMentorIdsKey = `mentor_ids_${prefix}`;
    let existingSuffixes = JSON.parse(localStorage.getItem(existingMentorIdsKey) || '[]');

    let finalInitials = baseInitials;

    while (existingSuffixes.includes(finalInitials)) {
        finalInitials = getNextLetterPair(finalInitials);
    }

    return `MEN${prefix}${finalInitials}`;
};

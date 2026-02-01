import type { ExportFormat } from '@/types/document';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const baseStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
});

const linkedInStyles = StyleSheet.create({
  ...baseStyles,
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0077b5', // LinkedIn blue
    marginBottom: 8,
  },
});

const indeedStyles = StyleSheet.create({
  ...baseStyles,
  page: {
    ...baseStyles.page,
    padding: 30,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});

const atsStyles = StyleSheet.create({
  ...baseStyles,
  page: {
    ...baseStyles.page,
    padding: 50,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: 'Times-Roman', // ATS-friendly font
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});

export function getStylesForFormat(format: ExportFormat) {
  switch (format) {
    case 'linkedin':
      return linkedInStyles;
    case 'indeed':
      return indeedStyles;
    case 'ats-friendly':
      return atsStyles;
    default:
      return baseStyles;
  }
}

export function optimizeForATS(content: string): string {
  // Remove special characters that ATS might not parse well
  return content
    .replace(/[^\w\s\-.,;:!?()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function optimizeForLinkedIn(content: string): string {
  // Add LinkedIn-specific formatting
  return content.replace(/\n/g, '\n\n'); // Double line breaks for LinkedIn
}

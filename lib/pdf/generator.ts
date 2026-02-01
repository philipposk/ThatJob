import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';
import type { GeneratedDocument, ExportFormat } from '@/types/document';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  contact: {
    fontSize: 10,
    marginBottom: 5,
  },
});

export function generateCVPDF(document: GeneratedDocument, format: ExportFormat = 'generic') {
  const cvContent = document.cv_content || '';

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.text }, cvContent)
      )
    )
  );
}

export function generateCoverLetterPDF(
  document: GeneratedDocument,
  format: ExportFormat = 'generic'
) {
  const coverContent = document.cover_content || '';

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.text }, coverContent)
      )
    )
  );
}

export function generateMergedPDF(document: GeneratedDocument) {
  const cvContent = document.cv_content || '';
  const coverContent = document.cover_content || '';

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Cover Letter'),
        React.createElement(Text, { style: styles.text }, coverContent)
      )
    ),
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Curriculum Vitae'),
        React.createElement(Text, { style: styles.text }, cvContent)
      )
    )
  );
}

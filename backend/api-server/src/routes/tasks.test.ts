import { describe, it, expect } from 'vitest';
import { stripMarkdownFences, validatePlan, parseAiJson } from './tasks';

describe('Intent-Based Task Creation JSON Validation (tasks.ts)', () => {
  describe('stripMarkdownFences', () => {
    it('returns plain JSON strings without modification', () => {
      const raw = '{"projectName":"Test","tasks":[]}';
      expect(stripMarkdownFences(raw)).toBe(raw);
    });

    it('strips ```json markdown fences', () => {
      const raw = '```json\n{"projectName":"Test","tasks":[]}\n```';
      expect(stripMarkdownFences(raw)).toBe('{"projectName":"Test","tasks":[]}');
    });

    it('strips generic ``` markdown fences', () => {
      const raw = '```\n{"projectName":"Test","tasks":[]}\n```';
      expect(stripMarkdownFences(raw)).toBe('{"projectName":"Test","tasks":[]}');
    });
  });

  describe('validatePlan', () => {
    it('validates and returns a well-formed plan', () => {
      const input = {
        projectName: '  Website Redesign  ',
        tasks: [
          { title: ' Create wireframes ', priority: 'High' },
          { title: 'Set up Vite', priority: 'Medium' },
          { title: 'Write tests', priority: 'Low' },
        ],
      };

      expect(validatePlan(input)).toEqual({
        projectName: 'Website Redesign',
        tasks: [
          { title: 'Create wireframes', priority: 'High' },
          { title: 'Set up Vite', priority: 'Medium' },
          { title: 'Write tests', priority: 'Low' },
        ],
      });
    });

    it('rejects null, non-objects, or missing projectName', () => {
      expect(validatePlan(null)).toBeNull();
      expect(validatePlan(123)).toBeNull();
      expect(validatePlan({ tasks: [] })).toBeNull();
      expect(validatePlan({ projectName: '   ', tasks: [] })).toBeNull();
    });

    it('rejects empty tasks array or invalid tasks structure', () => {
      expect(validatePlan({ projectName: 'Test', tasks: [] })).toBeNull();
      expect(validatePlan({ projectName: 'Test', tasks: 'not an array' })).toBeNull();
    });

    it('rejects task with invalid priority', () => {
      const input = {
        projectName: 'Test',
        tasks: [{ title: 'Do something', priority: 'Urgent' }],
      };
      expect(validatePlan(input)).toBeNull();
    });

    it('rejects task with missing or empty title', () => {
      const input = {
        projectName: 'Test',
        tasks: [{ title: '   ', priority: 'High' }],
      };
      expect(validatePlan(input)).toBeNull();
    });
  });

  describe('parseAiJson', () => {
    it('parses valid JSON response from AI provider', () => {
      const raw = JSON.stringify({
        projectName: 'Launch Campaign',
        tasks: [
          { title: 'Design banner', priority: 'High' },
          { title: 'Write copy', priority: 'Medium' },
        ],
      });

      const result = parseAiJson(raw);
      expect(result).toEqual({
        projectName: 'Launch Campaign',
        tasks: [
          { title: 'Design banner', priority: 'High' },
          { title: 'Write copy', priority: 'Medium' },
        ],
      });
    });

    it('parses JSON wrapped in markdown fences from AI provider', () => {
      const raw = `\`\`\`json
{
  "projectName": "Launch Campaign",
  "tasks": [
    { "title": "Design banner", "priority": "High" }
  ]
}
\`\`\``;

      const result = parseAiJson(raw);
      expect(result).toEqual({
        projectName: 'Launch Campaign',
        tasks: [{ title: 'Design banner', priority: 'High' }],
      });
    });

    it('returns null on invalid JSON string', () => {
      expect(parseAiJson('not json')).toBeNull();
    });
  });
});

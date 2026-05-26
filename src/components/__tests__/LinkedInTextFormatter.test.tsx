import { describe, it, expect } from 'vitest';
import {
  applyUnicodeMapping,
  formatBoldText,
  formatItalicText,
  formatCodeText,
  formatMarkdownText,
  unicodeMappings
} from '../features/LinkedInTextFormatterUtils';

describe('LinkedInTextFormatter', () => {
  describe('applyUnicodeMapping', () => {
    it('should map alphanumeric characters to their bold Unicode equivalents', () => {
      // Arrange
      const text = "Hello123";

      // Act
      const result = applyUnicodeMapping(text, 'bold');

      // Assert
      expect(result).toBe("𝗛𝗲𝗹𝗹𝗼𝟭𝟮𝟯");
    });

    it('should preserve special characters when mapping to Unicode', () => {
      // Arrange
      const text = "Hello, World! 123";

      // Act
      const result = applyUnicodeMapping(text, 'bold');

      // Assert
      expect(result).toBe("𝗛𝗲𝗹𝗹𝗼, 𝗪𝗼𝗿𝗹𝗱! 𝟭𝟮𝟯");
      expect(result).toContain(",");  // Special characters preserved
      expect(result).toContain("!");
      expect(result).toContain(" ");
    });

    it('should apply italic Unicode mapping to alphanumeric characters', () => {
      // Arrange
      const text = "Italic Text 123";

      // Act
      const result = applyUnicodeMapping(text, 'italic');

      // Assert
      expect(result).toBe("𝘐𝘵𝘢𝘭𝘪𝘤 𝘛𝘦𝘹𝘵 123");
    });

    it('should apply monospace Unicode mapping to alphanumeric characters', () => {
      // Arrange
      const text = "Code 123";

      // Act
      const result = applyUnicodeMapping(text, 'monospace');

      // Assert
      expect(result).toBe("𝙲𝚘𝚍𝚎 𝟷𝟸𝟹");
    });

    it('should return the original character if no mapping exists', () => {
      // Arrange
      const text = "Hello©®™";

      // Act
      const result = applyUnicodeMapping(text, 'bold');

      // Assert
      expect(result).toBe("𝗛𝗲𝗹𝗹𝗼©®™");
    });
  });

  describe('formatBoldText', () => {
    it('should use Unicode mapping when boldFont is "bold"', () => {
      // Arrange
      const text = "Bold Text";
      const boldFont = "bold";

      // Act
      const result = formatBoldText(text, boldFont);

      // Assert
      expect(result).toBe("𝗕𝗼𝗹𝗱 𝗧𝗲𝘅𝘁");
    });

    it('should use a prefix when boldFont is a single character', () => {
      // Arrange
      const text = "Bold Text";
      const boldFont = ">";

      // Act
      const result = formatBoldText(text, boldFont);

      // Assert
      expect(result).toBe("> Bold Text");
    });

    it('should wrap text with boldFont when it is not a placeholder or single character', () => {
      // Arrange
      const text = "Bold Text";
      const boldFont = "**";

      // Act
      const result = formatBoldText(text, boldFont);

      // Assert
      expect(result).toBe("**Bold Text**");
    });
  });

  describe('formatItalicText', () => {
    it('should use Unicode mapping when italicFont is "italic"', () => {
      // Arrange
      const text = "Italic Text";
      const italicFont = "italic";

      // Act
      const result = formatItalicText(text, italicFont);

      // Assert
      expect(result).toBe("𝘐𝘵𝘢𝘭𝘪𝘤 𝘛𝘦𝘹𝘵");
    });

    it('should use a prefix when italicFont is a single character', () => {
      // Arrange
      const text = "Italic Text";
      const italicFont = "~";

      // Act
      const result = formatItalicText(text, italicFont);

      // Assert
      expect(result).toBe("~ Italic Text");
    });

    it('should wrap text with italicFont when it is not a placeholder or single character', () => {
      // Arrange
      const text = "Italic Text";
      const italicFont = "_";

      // Act
      const result = formatItalicText(text, italicFont);

      // Assert
      expect(result).toBe("_Italic Text_");
    });
  });

  describe('formatCodeText', () => {
    it('should use Unicode mapping when codeStyle is "monospace"', () => {
      // Arrange
      const text = "Code Text";
      const codeStyle = "monospace";

      // Act
      const result = formatCodeText(text, codeStyle);

      // Assert
      expect(result).toBe("𝙲𝚘𝚍𝚎 𝚃𝚎𝚡𝚝");
    });

    it('should use a prefix when codeStyle is a single character', () => {
      // Arrange
      const text = "Code Text";
      const codeStyle = "|";

      // Act
      const result = formatCodeText(text, codeStyle);

      // Assert
      expect(result).toBe("| Code Text");
    });

    it('should wrap text with codeStyle when it is not a placeholder or single character', () => {
      // Arrange
      const text = "Code Text";
      const codeStyle = "`";

      // Act
      const result = formatCodeText(text, codeStyle);

      // Assert
      expect(result).toBe("`Code Text`");
    });
  });

  describe('formatMarkdownText', () => {
    it('should return empty string when input is empty', () => {
      // Arrange
      const text = "";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toBe("");
    });

    it('should format bold text correctly', () => {
      // Arrange
      const text = "This is **bold** text";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toBe("This is 𝗯𝗼𝗹𝗱 text");
    });

    it('should format italic text correctly', () => {
      // Arrange
      const text = "This is *italic* text";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toBe("This is 𝘪𝘵𝘢𝘭𝘪𝘤 text");
    });

    it('should format code text correctly', () => {
      // Arrange
      const text = "This is `code` text";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toBe("This is 𝚌𝚘𝚍𝚎 text");
    });

    it('should format headings correctly', () => {
      // Arrange
      const text = "# Heading";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toBe("𝗛𝗲𝗮𝗱𝗶𝗻𝗴");
    });

    it('should format bullet points correctly', () => {
      // Arrange
      const text = "- Bullet point";

      // Act
      const result = formatMarkdownText(text, {
        bulletReplacement: ".",
        boldFont: "bold",
        italicFont: "italic",
        headingPrefix: "",
        codeStyle: "monospace"
      });

      // Assert
      expect(result).toBe(". Bullet point");
    });

    it('should handle multiple markdown elements in the same text', () => {
      // Arrange
      const text = "# Heading\nThis is **bold** and *italic* and `code`.\n- Bullet point";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      expect(result).toContain("𝗛𝗲𝗮𝗱𝗶𝗻𝗴");
      expect(result).toContain("This is 𝗯𝗼𝗹𝗱 and 𝘪𝘵𝘢𝘭𝘪𝘤 and 𝚌𝚘𝚍𝚎");
      expect(result).toContain("→ Bullet point");
    });

    it('should handle nested formatting by using the highest priority formatting', () => {
      // Arrange
      const text = "This is **bold with *italic* inside**";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      // Bold has higher priority than italic, so the entire content should be bold
      expect(result).toBe("This is 𝗯𝗼𝗹𝗱 𝘄𝗶𝘁𝗵 𝗶𝘁𝗮𝗹𝗶𝗰 𝗶𝗻𝘀𝗶𝗱𝗲");
    });

    it('should handle custom configuration', () => {
      // Arrange
      const text = "# Heading\n**Bold**\n- Bullet";
      const customConfig = {
        bulletReplacement: "•",
        boldFont: "!",
        italicFont: "~",
        headingPrefix: "→ ",
        codeStyle: "≈"
      };

      // Act
      const result = formatMarkdownText(text, customConfig);

      // Assert
      expect(result).toContain("→ ! Heading");
      expect(result).toContain("! Bold");
      expect(result).toContain("• Bullet");
    });

    it('should handle incomplete or unmatched markdown tags', () => {
      // Arrange
      const text = "This is **bold without closing tag and *italic*";

      // Act
      const result = formatMarkdownText(text);

      // Assert
      // The unmatched bold tag should be treated as plain text
      expect(result).toContain("This is **bold without closing tag and 𝘪𝘵𝘢𝘭𝘪𝘤");
    });
  });
});

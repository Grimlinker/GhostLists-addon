function parseConfig(encoded) {
    try {
      if (!encoded) return {};
      const decoded = Buffer.from(encoded, 'base64').toString();
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse config from URL:", e);
      return {};
    }
  }
  
  module.exports = { parseConfig };
  
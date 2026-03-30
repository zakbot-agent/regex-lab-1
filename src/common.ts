/** Common regex patterns catalog — zero dependencies */

export interface CommonPattern {
  name: string;
  pattern: string;
  description: string;
  examples: string[];
}

const PATTERNS: CommonPattern[] = [
  {
    name: "email",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    description: "Email address",
    examples: ["user@example.com", "john.doe+tag@sub.domain.org"],
  },
  {
    name: "url",
    pattern: "https?://[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})(?:/[^\\s]*)?",
    description: "HTTP/HTTPS URL",
    examples: ["https://example.com", "http://sub.domain.org/path?q=1"],
  },
  {
    name: "phone",
    pattern: "\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
    description: "Phone number (international)",
    examples: ["+1-555-123-4567", "(555) 123-4567"],
  },
  {
    name: "ipv4",
    pattern: "(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)",
    description: "IPv4 address",
    examples: ["192.168.1.1", "10.0.0.255"],
  },
  {
    name: "ipv6",
    pattern: "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",
    description: "IPv6 address (full form)",
    examples: ["2001:0db8:85a3:0000:0000:8a2e:0370:7334"],
  },
  {
    name: "date-iso",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    description: "ISO 8601 date (YYYY-MM-DD)",
    examples: ["2026-03-29", "1999-12-31"],
  },
  {
    name: "date-us",
    pattern: "(?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01])/\\d{4}",
    description: "US date (MM/DD/YYYY)",
    examples: ["03/29/2026", "12/31/1999"],
  },
  {
    name: "time",
    pattern: "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?",
    description: "Time (HH:MM or HH:MM:SS, 24h)",
    examples: ["14:30", "23:59:59"],
  },
  {
    name: "hex-color",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}",
    description: "Hex color code",
    examples: ["#fff", "#1a2b3c"],
  },
  {
    name: "credit-card",
    pattern: "\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}",
    description: "Credit card number (with optional separators)",
    examples: ["4111-1111-1111-1111", "5500 0000 0000 0004"],
  },
  {
    name: "zip-us",
    pattern: "\\d{5}(?:-\\d{4})?",
    description: "US ZIP code",
    examples: ["90210", "90210-1234"],
  },
  {
    name: "slug",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    description: "URL slug",
    examples: ["my-awesome-post", "hello-world-123"],
  },
  {
    name: "username",
    pattern: "^[a-zA-Z0-9_-]{3,20}$",
    description: "Username (3-20 chars, alphanumeric, _, -)",
    examples: ["john_doe", "user-123"],
  },
  {
    name: "strong-password",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$",
    description: "Strong password (8+, upper, lower, digit, special)",
    examples: ["P@ssw0rd!", "Str0ng#Pass"],
  },
  {
    name: "uuid",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
    description: "UUID v4",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
  },
  {
    name: "mac-address",
    pattern: "(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}",
    description: "MAC address",
    examples: ["00:1B:44:11:3A:B7"],
  },
  {
    name: "semver",
    pattern: "\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9.]+)?(?:\\+[a-zA-Z0-9.]+)?",
    description: "Semantic version",
    examples: ["1.0.0", "2.3.1-beta.1"],
  },
];

export function getPattern(name: string): CommonPattern | undefined {
  return PATTERNS.find((p) => p.name === name.toLowerCase());
}

export function listPatterns(): CommonPattern[] {
  return PATTERNS;
}

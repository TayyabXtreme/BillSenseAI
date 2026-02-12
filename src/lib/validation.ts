// Disposable / temporary email domain blocklist
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "guerrillamail.info", "guerrillamail.net", "guerrillamail.org", "guerrillamail.de",
  "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.org",
  "10minutemail.com", "10minutemail.net", "tempinbox.com", "fakeinbox.com",
  "mailnesia.com", "maildrop.cc", "dispostable.com", "temp-mail.org",
  "getnada.com", "mohmal.com", "mailcatch.com", "tempail.com",
  "tmail.ws", "harakirimail.com", "jetable.org", "mytemp.email",
  "mailtemp.net", "throwam.com", "mailsac.com", "burnermail.io",
  "inboxkitten.com", "33mail.com", "emailondeck.com", "crazymailing.com",
  "tempr.email", "discard.email", "discardmail.com", "discardmail.de",
  "mailnull.com", "spamgourmet.com", "spamgourmet.net", "trashymail.com",
  "trashymail.net", "nowmymail.com", "trash-mail.com", "bugmenot.com",
  "dead-letter.email", "deadfake.cf", "deadfake.ga", "deadfake.ml",
  "deagot.com", "despam.it", "devnullmail.com", "fakemailgenerator.com",
  "getairmail.com", "mailexpire.com", "mailforspam.com", "mailme.lv",
  "mailnator.com", "meltmail.com", "mintemail.com", "mt2015.com",
  "nomail.xl.cx", "objectmail.com", "proxymail.eu", "putthisinyouremail.com",
  "quickinbox.com", "rcpt.at", "reallymymail.com", "recode.me",
  "spamavert.com", "spambox.us", "spamfree24.org", "spamspot.com",
  "tempomail.fr", "temporaryemail.net", "temporaryforwarding.com",
  "temporaryinbox.com", "themailpro.com", "wegwerfmail.de", "wegwerfmail.net",
  "wegwerfmail.org", "wh4f.org", "whyspam.me", "xagloo.com",
  "zehnminuten.de", "zippymail.info", "mailseal.de", "klzlk.com",
]);

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return { field: "email", message: "Email address is required" };
  }

  // Basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { field: "email", message: "Please enter a valid email address" };
  }

  // Check for disposable email
  const domain = trimmed.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return {
      field: "email",
      message: "Disposable/temporary emails are not allowed. Please use a real email.",
    };
  }

  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }

  if (password.length < 8) {
    return { field: "password", message: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one uppercase letter (A-Z)",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one lowercase letter (a-z)",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one number (0-9)",
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one special character (!@#$%...)",
    };
  }

  return null;
}

export function validateName(name: string, fieldLabel = "Name"): ValidationError | null {
  if (!name.trim()) {
    return { field: "name", message: `${fieldLabel} is required` };
  }
  if (name.trim().length < 2) {
    return { field: "name", message: `${fieldLabel} must be at least 2 characters` };
  }
  return null;
}

export function getPasswordStrength(password: string): {
  score: number; // 0-5
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 5
  score = Math.min(score, 5);

  const levels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-400" },
    { label: "Very Strong", color: "bg-green-500" },
  ];

  return { score, ...levels[score] };
}

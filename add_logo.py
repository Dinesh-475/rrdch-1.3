import os
import re

# Add logo to nav-brand if not already there
regex = re.compile(r'(<a href="index\.html" class="nav-brand">)\s*(<span)', re.DOTALL)
replacement = r'\1\n            <img src="images/logo.png" alt="RRDCH" style="height:36px;width:auto;border-radius:4px;">\n            \2'

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Only replace if logo img not already present
        if 'images/logo.png' not in content or 'nav-brand' in content:
            new_content = regex.sub(replacement, content)
            if new_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Added logo to {file}')
            else:
                print(f'No change needed in {file}')

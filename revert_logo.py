import os
import re

# Revert all pages EXCEPT admission_enquiry.html back to external logo URL
regex = re.compile(r'<img src="images/logo\.png" alt="RRDCH Logo" class="nav-logo">')
replacement = '<img src="https://www.rrdch.org/rrdch/wp-content/uploads/2024/04/rrdch-logo-blue.png" alt="RRDCH Logo" class="nav-logo">'

for file in os.listdir('.'):
    if file.endswith('.html') and file != 'admission_enquiry.html':
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = regex.sub(replacement, content)
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Reverted logo in {file}')
        else:
            print(f'No change in {file}')

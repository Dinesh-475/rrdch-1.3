import os
import re

# Match the specific Book Appointment button in the nav-actions
regex1 = re.compile(r'<a href="patients\.html"[^>]*data-i18n="btn_book"[^>]*>Book Appointment</a>')
regex2 = re.compile(r'<a href="patients\.html"\s+class="btn btn-primary">Book Appointment</a>')

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Only remove the one inside nav-actions. There might be one in Hero.
        # So we look for <div class="nav-actions"> ... </div> and sub inside it.
        def replace_nav_actions(match):
            inner = match.group(0)
            inner = regex1.sub('', inner)
            inner = regex2.sub('', inner)
            return inner
            
        nav_action_regex = re.compile(r'<div class="nav-actions">.*?</div>', re.DOTALL)
        new_content = nav_action_regex.sub(replace_nav_actions, content)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')

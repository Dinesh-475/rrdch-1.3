import os
import re

files_to_update = ['about.html', 'admission_enquiry.html', 'admissions.html', 'contact.html', 'departments.html', 'doctors.html', 'patients.html', 'students.html']

with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Extract inner of ul.nav-links unified-nav from index.html
match = re.search(r'(<ul class="nav-links unified-nav">.*?</ul>)', idx_content, re.DOTALL)
if not match:
    print("Could not find new nav-links in index.html")
    exit(1)

new_ul = match.group(1)

for file in files_to_update:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # In older files, it might be <ul class="nav-links">
    replaced = re.sub(r'<ul class="nav-links".*?</ul>', new_ul, content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(replaced)
        
print("Updated all HTML files successfully.")

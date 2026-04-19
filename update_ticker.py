import os
import re

NEW_TICKER = '''<div class="announcement-bar">
    <div class="ticker-content">
        <span>🦷 Dr. Sharma is currently seeing Token No. 42 in Orthodontics</span>
        <span>📅 Upcoming Annual Dental Symposium – Registrations Open</span>
        <span>🚨 Emergency Dental Care is Available 24/7</span>
        <span>📋 Applications invited for Certificate Course in Implantology (2026–2027) — Send to: <a href="mailto:pgrrdc@gmail.com" target="_blank">pgrrdc@gmail.com</a></span>
        <span>🎓 <a href="https://www.rrdch.org/rrdch/wp-content/uploads/2025/03/Ph.D-Entrance-Exam-Notification.pdf" target="_blank" rel="noopener noreferrer">PhD Entrance Examination Notification – Click to View Details</a></span>
        <span>📝 <a href="admission_enquiry.html">Admission Enquiry for Academic Year 2026 – Apply Now</a></span>
    </div>
</div>'''

regex = re.compile(r'<div class="announcement-bar">.*?</div>', re.DOTALL)

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = regex.sub(NEW_TICKER, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated ticker in {file}')

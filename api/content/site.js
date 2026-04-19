const { json } = require("../_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { ok: false, msg: "Method not allowed." });

  // Minimal localized public content manifest (extend over time).
  return json(res, 200, {
    ok: true,
    data: {
      heroMoments: [
        {
          id: "campus",
          image: "images/new_hero_bg.png",
          title: "A campus built for clinical excellence",
          titleKn: "ಕ್ಲಿನಿಕಲ್ ಶ್ರೇಷ್ಠತೆಗೆ ನಿರ್ಮಿತ ಕ್ಯಾಂಪಸ್",
          caption: "RRDCH blends advanced dental care with strong academic mentorship.",
          captionKn: "RRDCH ಉನ್ನತ ದಂತ ಚಿಕಿತ್ಸೆ ಹಾಗೂ ಗುಣಮಟ್ಟದ ಮಾರ್ಗದರ್ಶನವನ್ನು ಒಟ್ಟಿಗೆ ನೀಡುತ್ತದೆ."
        }
      ],
      leadership: [
        {
          id: "chairman",
          image: "pictures/rrdch-website/assets/images/management/chairman.jpg",
          title: "Chairman’s Desk",
          titleKn: "ಅಧ್ಯಕ್ಷರ ಸಂದೇಶ",
          role: "Chairman",
          roleKn: "ಅಧ್ಯಕ್ಷರು",
          description:
            "We welcome you to RRDCH — a place where compassionate care and rigorous education grow together.",
          descriptionKn:
            "RRDCH ಗೆ ಸ್ವಾಗತ — ಇಲ್ಲಿ ಮಾನವೀಯ ಆರೈಕೆ ಮತ್ತು ಕಠಿಣ ಶೈಕ್ಷಣಿಕ ಶಿಸ್ತೊಂದುಗೂಡಿ ಬೆಳೆಯುತ್ತದೆ."
        }
      ],
      facilities: [
        {
          id: "auditorium",
          image: "images/media__1776159199698.jpg",
          title: "Auditorium",
          titleKn: "ಆಡಿಟೋರಿಯಮ್",
          caption: "Conferences, CME programs, and student events.",
          captionKn: "ಸಮ್ಮೇಳನಗಳು, CME ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಕಾರ್ಯಕ್ರಮಗಳು."
        },
        {
          id: "library",
          image: "images/media__1776159199603.jpg",
          title: "Library & Digital Learning",
          titleKn: "ಗ್ರಂಥಾಲಯ ಮತ್ತು ಡಿಜಿಟಲ್ ಕಲಿಕೆ",
          caption: "Curated resources for BDS, MDS and research.",
          captionKn: "BDS, MDS ಮತ್ತು ಸಂಶೋಧನೆಗಾಗಿ ಆಯ್ದ ಸಂಪನ್ಮೂಲಗಳು."
        }
      ],
      documents: [
        {
          id: "nabh",
          image: "images/media__1776162900120.png",
          title: "NABH",
          titleKn: "NABH",
          href: "https://www.rrdch.org/rrdch/wp-content/uploads/2021/09/RRDCH-NABH-accredited.pdf"
        },
        {
          id: "naac",
          image: "images/media__1776162900148.png",
          title: "NAAC",
          titleKn: "NAAC",
          href: "https://www.rrdch.org/rrdch/wp-content/uploads/2013/08/Certificate-of-Accreditation.pdf"
        }
      ]
    }
  });
};


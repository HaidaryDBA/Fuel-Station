// import {
//   Facebook,
//   Twitter,
//   Instagram,
//   MapPin,
//   Phone,
//   Mail,
// } from "lucide-react";

// function Footer() {
//   return (
//     <footer className="bg-card border-t border-border">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid md:grid-cols-4 gap-8">
//           {/* School Info */}
//           <div className="col-span-2 md:col-span-1">
//             <div className="flex items-center space-x-3 mb-4">
//               <img
//                 className="inset-0 flex items-center justify-center text-white font-bold text-lg"
//                 src="images/logo.png"
//                 alt=""
//               />
//             </div>
//             <p className="text-text-secondary mb-4">
//               Empowering minds and shaping futures through excellence in
//               education.
//             </p>
//             <div className="flex space-x-3">
//               <a
//                 href="#"
//                 className="w-10 h-10 bg-surface hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-200 group"
//               >
//                 <Facebook className="w-5 h-5 text-text-secondary group-hover:text-white" />
//               </a>
//               <a
//                 href="#"
//                 className="w-10 h-10 bg-surface hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-200 group"
//               >
//                 <Twitter className="w-5 h-5 text-text-secondary group-hover:text-white" />
//               </a>
//               <a
//                 href="#"
//                 className="w-10 h-10 bg-surface hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-200 group"
//               >
//                 <Instagram className="w-5 h-5 text-text-secondary group-hover:text-white" />
//               </a>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="text-lg font-bold text-text-primary mb-4">
//               Quick Links
//             </h3>
//             <ul className="space-y-2">
//               {[
//                 "About Us",
//                 "Academics",
//                 "Admissions",
//                 "News & Events",
//                 "Contact",
//               ].map((link) => (
//                 <li key={link}>
//                   <a
//                     href="#"
//                     className="text-text-secondary hover:text-primary transition-colors duration-200"
//                   >
//                     {link}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Portals */}
//           <div>
//             <h3 className="text-lg font-bold text-text-primary mb-4">
//               Portals
//             </h3>
//             <ul className="space-y-2">
//               {[
//                 "Student Portal",
//                 "Teacher Portal",
//                 "Parent Portal",
//                 "Staff Portal",
//                 "Alumni Portal",
//               ].map((link) => (
//                 <li key={link}>
//                   <a
//                     href="#"
//                     className="text-text-secondary hover:text-primary transition-colors duration-200"
//                   >
//                     {link}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h3 className="text-lg font-bold text-text-primary mb-4">
//               Contact Us
//             </h3>
//             <ul className="space-y-3">
//               <li className="flex items-start space-x-3">
//                 <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
//                 <span className="text-text-secondary">
//                   123 Education Street, Knowledge City, KC 12345
//                 </span>
//               </li>
//               <li className="flex items-center space-x-3">
//                 <Phone className="w-5 h-5 text-primary flex-shrink-0" />
//                 <span className="text-text-secondary">+1 (555) 123-4567</span>
//               </li>
//               <li className="flex items-center space-x-3">
//                 <Mail className="w-5 h-5 text-primary flex-shrink-0" />
//                 <span className="text-text-secondary">info@sultanzoy.edu</span>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary">
//           <p>&copy; 2025 Sultan Zoy High School. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { key: "aboutUs", label: t("footer.quickLinks.aboutUs") },
    { key: "academics", label: t("footer.quickLinks.academics") },
    { key: "admissions", label: t("footer.quickLinks.admissions") },
    { key: "newsEvents", label: t("footer.quickLinks.newsEvents") },
    { key: "contact", label: t("footer.quickLinks.contact") },
  ];

  const portals = [
    { key: "student", label: t("footer.portals.student") },
    { key: "teacher", label: t("footer.portals.teacher") },
    { key: "parent", label: t("footer.portals.parent") },
    { key: "staff", label: t("footer.portals.staff") },
    { key: "alumni", label: t("footer.portals.alumni") },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="/images/logo.png"
              alt="SultanZoi High School Logo"
              className="mb-4"
            />

            <p className="text-text-secondary mb-4">
              {t("footer.schoolDescription")}
            </p>

            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-surface hover:bg-primary rounded-lg flex items-center justify-center transition group"
                >
                  <Icon className="w-5 h-5 text-text-secondary group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t("footer.quickLinks.title")}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a className="text-text-secondary hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t("footer.portals.title")}
            </h3>
            <ul className="space-y-2">
              {portals.map((link) => (
                <li key={link.key}>
                  <a className="text-text-secondary hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t("footer.contactUs.title")}
            </h3>

            <ul className="space-y-3 text-text-secondary">
              <li className="flex gap-3">
                <MapPin className="text-primary" />
                {t("footer.contactUs.address")}
              </li>

              <li className="flex gap-3">
                <Phone className="text-primary" />
                +93 790 328032
              </li>

              <li className="flex gap-3">
                <Mail className="text-primary" />
                info@sultanzoi-phs.com
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-6 text-center text-text-secondary">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import {
  BookOpen,
  Briefcase,
  ChevronDown,
  GraduationCap,
  Globe,
  Home,
  ImageIcon,
  Info,
  Menu,
  Moon,
  Newspaper,
  Phone,
  Shield,
  Sun,
  Trophy,
  Users,
  Award,
  Building,
  Camera,
  Clock,
  HandHeart,
  Heart,
  Lightbulb,
  MapPin,
  MessageSquare,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<
    string | null
  >(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  // Replace your NAVIGATION_ITEMS constant with this:
  const NAVIGATION_ITEMS = [
    {
      name: t("nav.home"),
      key: "nav.home",
      page: "/",
      icon: Home,
    },

    {
      name: t("nav.about"),
      key: "nav.about",
      page: "about",
      icon: Info,
      children: [
        {
          name: t("about.page.title"),
          key: "nav.about",
          page: "about",
          icon: Clock,
        },

        {
          name: t("nav.about.teachers"),
          key: "nav.about.teachers",
          page: "team",
          icon: Users,
        },
      ],
    },
    {
      name: t("nav.academics"),
      key: "nav.academics",
      page: "academics",
      icon: GraduationCap,
      children: [
        {
          name: t("nav.academics.programs"),
          key: "nav.academics.programs",
          page: "academic-programs",
          icon: BookOpen,
        },

        {
          name: t("nav.academics.projects"),
          key: "nav.academics.projects",
          page: "student-projects",
          icon: Lightbulb,
        },
        {
          name: t("nav.academics.onlineLibrary"),
          key: "nav.academics.onlineLibrary",
          page: "online-library",
          icon: BookOpen,
        },
        {
          name: t("nav.academics.libraryServices"),
          key: "nav.academics.libraryServices",
          page: "library-services",
          icon: Building,
        },
        {
          name: t("nav.academics.educationalTrips"),
          key: "nav.academics.educationalTrips",
          page: "educational-trips",
          icon: MapPin,
        },
        {
          name: t("nav.academics.competitions"),
          key: "nav.academics.competitions",
          page: "competitions-contests",
          icon: Trophy,
        },
      ],
    },
    {
      name: t("nav.studentsactivities"),
      key: "nav.students",
      page: "students",
      icon: Users,
      children: [
        {
          name: t("nav.students.sportsTeams"),
          key: "nav.students.sportsTeams",
          page: "sports-teams",
          icon: Trophy,
        },
        {
          name: t("nav.students.cultural"),
          key: "nav.students.cultural",
          page: "cultural-performing-arts",
          icon: Star,
        },
        {
          name: t("nav.students.artsCrafts"),
          key: "nav.students.artsCrafts",
          page: "arts-crafts",
          icon: ImageIcon,
        },
        {
          name: t("nav.students.recreational"),
          key: "nav.students.recreational",
          page: "recreational-activities",
          icon: Heart,
        },
      ],
    },

    {
      name: t("nav.media"),
      key: "nav.media",
      page: "media",
      icon: ImageIcon,
      children: [
        {
          name: t("nav.newsEvents"),
          key: "nav.newsEvents",
          page: "news-and-events",
          icon: Newspaper,
        },
        {
          name: t("nav.media.gallery"),
          key: "nav.media.gallery",
          page: "gallery",
          icon: Camera,
        },

        {
          name: t("nav.media.studentArtwork"),
          key: "nav.media.studentArtwork",
          page: "student-artwork",
          icon: ImageIcon,
        },
        {
          name: t("nav.media.historicalPhotos"),
          key: "nav.media.historicalPhotos",
          page: "historical-photos",
          icon: Camera,
        },
      ],
    },
    {
      name: t("nav.careers"),
      key: "nav.careers",
      page: "careers",
      icon: Briefcase,
      children: [
        {
          name: t("nav.careers.opportunities"),
          key: "nav.careers.opportunities",
          page: "careers",
          icon: Briefcase,
        },
        {
          name: t("nav.academics.internships"),
          key: "nav.academics.internships",
          page: "internships-work-experience",
          icon: Briefcase,
        },
      ],
    },
    {
      name: t("nav.community"),
      key: "nav.community",
      page: "community",
      icon: Heart,
      children: [
        {
          name: t("nav.community.support"),
          key: "nav.community.support",
          page: "community-support",
          icon: HandHeart,
        },
        {
          name: t("nav.community.charityEvents"),
          key: "nav.community.charityEvents",
          page: "charity-events",
          icon: Heart,
        },
        {
          name: t("nav.parents"),
          key: "nav.parents",
          page: "parents",
          icon: Users,
        },

        {
          name: t("nav.careers.alumniRelations"),
          key: "nav.careers.alumniRelations",
          page: "alumni-relations",
          icon: Users,
        },
      ],
    },
    {
      name: t("nav.achievements"),
      key: "nav.achievements",
      page: "achievements",
      icon: Trophy,
      children: [
        {
          name: t("nav.achievements.schoolAwards"),
          key: "nav.achievements.schoolAwards",
          page: "school-awards",
          icon: Trophy,
        },
        {
          name: t("nav.achievements.studentAchievements"),
          key: "nav.achievements.studentAchievements",
          page: "awards-and-achievements",
          icon: Star,
        },

        {
          name: t("nav.achievements.honorsCertificates"),
          key: "nav.achievements.honorsCertificates",
          page: "honors-certificates",
          icon: Award,
        },
        {
          name: t("nav.achievements.testimonials"),
          key: "nav.achievements.testimonials",
          page: "testimonials",
          icon: MessageSquare,
        },
      ],
    },
    {
      name: t("nav.contact"),
      key: "nav.contact",
      page: "contact",
      icon: Phone,
      children: [
        {
          name: t("nav.contact.us"),
          key: "nav.contact.us",
          page: "contact",
          icon: Phone,
        },
        {
          name: t("nav.contact.locationMap"),
          key: "nav.contact.locationMap",
          page: "school-location-map",
          icon: MapPin,
        },
        {
          name: t("nav.contact.securityPrivacy"),
          key: "nav.contact.securityPrivacy",
          page: "security-privacy-page",
          icon: Shield,
        },
        {
          name: t("nav.contact.feedbackForm"),
          key: "nav.contact.feedbackForm",
          page: "feedback-form",
          icon: MessageSquare,
        },
      ],
    },
  ];

  const languages = [
    { code: "en", name: t("language.english"), flag: "🇬🇧" },
    { code: "da", name: t("language.dari"), flag: "🇦🇫" },
    { code: "pa", name: t("language.pashto"), flag: "🇦🇫" },
  ];

  // Check if any child is active for a parent item
  const isParentActive = (item: (typeof NAVIGATION_ITEMS)[0]) => {
    if (!item.children) return false;
    return item.children.some(
      (child) =>
        location.pathname === `/${child.page}` ||
        location.pathname === child.page
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleNavClick = (page: string) => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileActiveDropdown(null);
    navigate(page.startsWith("/") ? page : `/${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMobileDropdown = (key: string) => {
    setMobileActiveDropdown(mobileActiveDropdown === key ? null : key);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-white/95 border-gray-200 shadow-lg dark:bg-gray-900/95 dark:border-gray-700"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center ">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("/");
              }}
              className="flex items-center space-x-3 group"
            >
              <div className=" relative w-35 h-20  overflow-hidden  transition-all duration-300">
                <img
                  className="absolute top-4 inset-0 flex items-center justify-center text-white font-bold text-lg"
                  src="images/logo.png"
                  alt=""
                />
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAVIGATION_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="relative group px-1"
                  onMouseEnter={() =>
                    item.children && setActiveDropdown(item.key)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => !item.children && handleNavClick(item.page)}
                    className={` flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname === `/${item.page}` ||
                      location.pathname === item.page ||
                      isParentActive(item)
                        ? "text-[#0B7A4B] dark:text-[#66BB4A] bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-[#0B7A4B] dark:hover:text-[#66BB4A] hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <span className="text-nowrap">{item.name}</span>
                    {item.children && (
                      <ChevronDown
                        className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.key ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {item.children && (
                    <div
                      className={` absolute top-full start-0  w-56  transform transition-all duration-200 origin-top-left ${
                        activeDropdown === item.key
                          ? "opacity-100 scale-100 visible "
                          : "opacity-0 scale-95 invisible"
                      }`}
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden ring-1 ring-black/5 p-1">
                        {item.children.map((child) => (
                          <button
                            key={child.key}
                            onClick={() => handleNavClick(child.page)}
                            className={`w-full flex items-center px-3 py-2.5 my-1.5 text-sm rounded-lg transition-colors ${
                              location.pathname === `/${child.page}` ||
                              location.pathname === child.page
                                ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                                : "text-gray-600 dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-gray-800"
                            }`}
                          >
                            {child.icon && (
                              <child.icon className="w-4 h-4 me-2 opacity-70" />
                            )}
                            <span className="text-start">{child.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden  lg:flex items-center space-x-3 ">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  onBlur={() =>
                    setTimeout(() => setLanguageDropdownOpen(false), 200)
                  }
                  className="flex items-center gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
                  aria-label={t("language.select")}
                >
                  <Globe size={20} />
                  <span className="text-xs font-medium uppercase">
                    {i18n.language}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      languageDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {languageDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-black/5 py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          i18n.language === lang.code
                            ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
                aria-label={t("nav.toggleTheme")}
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <Link to="/mis" className="px-2 text-nowrap py-2.5 bg-[#0B7A4B] dark:bg-[#66BB4A] text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-[#095d39] dark:hover:bg-[#5aa93f] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                {t("nav.portalLogin")}
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 z-50 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Overlay backdrop */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Menu Sidebar */}
        <div
          className={`lg:hidden bg-background fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className=" relative w-50 h-20 overflow-hidden  transition-all duration-300">
              <img
                className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg"
                src="images/logo.png"
                alt=""
              />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto h-[calc(100%-180px)] px-4 py-4">
            {NAVIGATION_ITEMS.map((item) => (
              <div
                key={item.key}
                className="border-b border-gray-100 dark:border-gray-800/50 pb-3 mb-3 last:border-0"
              >
                {item.children ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleMobileDropdown(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-3 text-base font-medium rounded-lg transition-all ${
                        isParentActive(item)
                          ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && (
                          <item.icon
                            className={`w-5 h-5 ${
                              isParentActive(item)
                                ? "text-[#0B7A4B] dark:text-[#66BB4A]"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        {item.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          mobileActiveDropdown === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        mobileActiveDropdown === item.key
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-1 pl-3 pt-1">
                        {item.children.map((child) => (
                          <button
                            key={child.key}
                            onClick={() => handleNavClick(child.page)}
                            className={`w-full text-start flex items-center gap-2 text-sm py-2.5 px-3 rounded-md transition-colors ${
                              location.pathname === `/${child.page}` ||
                              location.pathname === child.page
                                ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A] font-medium"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {child.icon && (
                              <child.icon className="w-4 h-4 opacity-70" />
                            )}
                            {child.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.page)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-all ${
                      location.pathname === `/${item.page}` ||
                      location.pathname === item.page
                        ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon && (
                      <item.icon
                        className={`w-5 h-5 ${
                          location.pathname === `/${item.page}` ||
                          location.pathname === item.page
                            ? "text-[#0B7A4B] dark:text-[#66BB4A]"
                            : "text-gray-400"
                        }`}
                      />
                    )}
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
                {t("language.select")}
              </p>
              <div className="py-6  grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                      i18n.language === lang.code
                        ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer section with language selector and login */}
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-gray-100 dark:border-gray-800 px-4 py-4">
            {/* Login Button */}
            <button className="w-full py-3 bg-[#0B7A4B] dark:bg-[#66BB4A] text-white dark:text-gray-900 font-semibold rounded-xl shadow-lg shadow-[#0B7A4B]/30 dark:shadow-[#66BB4A]/30 active:scale-95 transition-all">
              {t("nav.portalLogin")}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

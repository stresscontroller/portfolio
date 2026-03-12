/* Change this file to get your personal Porfolio */

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
};

//SEO Related settings
const seo = {
  title: "Daniel's Portfolio",
  description:
    "Hi, I’m a Senior Full-Stack Developer passionate about building clean, scalable, and user-friendly digital products. I enjoy solving challenging problems and turning ideas into reliable web platforms, mobile apps, and automation tools that people genuinely enjoy using.",
  og: {
    title: "Daniel Jin Portfolio",
    type: "website",
    url: "http://danieljin.info/",
  },
};

//Home Page
const greeting = {
  title: "Daniel Jin",
  logo_name: "Daniel Jin",
  // nickname: "layman_brother",
  subTitle:
    "Hi, I’m a Senior Full-Stack Developer passionate about building clean, scalable, and user-friendly digital products. I enjoy solving challenging problems and turning ideas into reliable web platforms, mobile apps, and automation tools that people genuinely enjoy using.",
  resumeLink:
    "https://drive.google.com/file/d/1PAgj8Nge9R7z6VF7XhLehmE309uJ_vss/view?usp=sharing",
  portfolio_repository: "https://github.com/stresscontroller/portfolio",
  githubProfile: "https://github.com/stresscontroller",
};

const socialMediaLinks = [
  {
    name: "Github",
    link: "https://github.com/stresscontroller",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/daniel-jin-5b15843b6/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "Gmail",
    link: "mailto:talentdev.dj@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "Telegram",
    link: "https://t.me/daniel3619",
    fontAwesomeIcon: "fa-telegram", // Reference https://fontawesome.com/icons/x-twitter?f=brands&s=solid
    backgroundColor: "#279fda", // Reference https://simpleicons.org/?q=x
  },
  {
    name: "Medium",
    link: "https://medium.com/@talentdev.dj",
    fontAwesomeIcon: "fa-medium", // Reference https://fontawesome.com/icons/medium?f=brands&s=solid
    backgroundColor: "#000000", // Reference https://simpleicons.org/?q=medium
  },
];

const skills = {
  data: [
    {
      title: "Data Science & AI",
      fileName: "DataScienceImg",
      skills: [
        "⚡ Developing highly scalable production ready models for various deep learning and statistical use cases",
        "⚡ Experience of working with Computer Vision and NLP projects",
        "⚡ Complex quantitative modelling for dynamic forecasting and time series analysis",
      ],
      softwareSkills: [
        {
          skillName: "Tensorflow",
          fontAwesomeClassname: "logos-tensorflow",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Keras",
          fontAwesomeClassname: "simple-icons:keras",
          style: {
            backgroundColor: "white",
            color: "#D00000",
          },
        },
        {
          skillName: "PyTorch",
          fontAwesomeClassname: "logos-pytorch",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "simple-icons:python",
          style: {
            backgroundColor: "transparent",
            color: "#3776AB",
          },
        },
        {
          skillName: "Deep Learning",
          fontAwesomeClassname: "simple-icons:deepl",
          style: {
            backgroundColor: "transparent",
            color: "#000000",
          },
        },
      ],
    },
    {
      title: "Full Stack Development",
      fileName: "FullStackImg",
      skills: [
        "⚡ Building responsive website front end using Next.js, Angular, Tailwind, etc.",
        "⚡ Developing application backend in NodeJS, Django, Laravel, .NET, etc.",
        "⚡ Using PostgreSQL, MongoDB, MySQL, etc as database systems",
        "⚡ Creating content management systems using WordPress, Shopify, Drupal, etc.",
      ],
      softwareSkills: [
        {
          skillName: "Sass",
          fontAwesomeClassname: "simple-icons:sass",
          style: {
            color: "#CC6699",
          },
        },
        {
          skillName: "React",
          fontAwesomeClassname: "simple-icons:react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "Next.js",
          fontAwesomeClassname: "simple-icons:nextdotjs",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "Angular",
          fontAwesomeClassname: "simple-icons:angular",
          style: {
            color: "#DD0031",
          },
        },
        {
          skillName: "Vue.js",
          fontAwesomeClassname: "simple-icons:vuedotjs",
          style: {
            color: "#4FC08D",
          },
        },
        {
          skillName: "Django",
          fontAwesomeClassname: "simple-icons:django",
          style: {
            color: "#092E20",
          },
        },
        {
          skillName: "FastAPI",
          fontAwesomeClassname: "simple-icons:fastapi",
          style: {
            color: "#009688",
          },
        },
        {
          skillName: "NodeJS",
          fontAwesomeClassname: "devicon-plain:nodejs-wordmark",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "NestJS",
          fontAwesomeClassname: "simple-icons:nestjs",
          style: {
            color: "#E0234E",
          },
        },
        {
          skillName: "Laravel",
          fontAwesomeClassname: "simple-icons:laravel",
          style: {
            color: "#FF2D20",
          },
        },
        {
          skillName: "PostgreSQL",
          fontAwesomeClassname: "simple-icons:postgresql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "MongoDB",
          fontAwesomeClassname: "simple-icons:mongodb",
          style: {
            color: "#47A248",
          },
        },
        {
          skillName: "MySQL",
          fontAwesomeClassname: "simple-icons:mysql",
          style: {
            color: "#4479A1",
          },
        },
        {
          skillName: "Shopify",
          fontAwesomeClassname: "simple-icons:shopify",
          style: {
            color: "#96BE3E",
          },
        },
        {
          skillName: "WordPress",
          fontAwesomeClassname: "simple-icons:wordpress",
          style: {
            color: "#21759B",
          },
        },
        {
          skillName: "Stripe",
          fontAwesomeClassname: "simple-icons:stripe",
          style: {
            color: "#008CD8",
          },
        },
        {
          skillName: "Redux",
          fontAwesomeClassname: "simple-icons:redux",
          style: {
            color: "#764ABC",
          },
        },
        {
          skillName: "OAuth",
          fontAwesomeClassname: "simple-icons:auth0",
          style: {
            color: "#F8BB27",
          },
        },
        {
          skillName: "Redis",
          fontAwesomeClassname: "simple-icons:redis",
          style: {
            color: "#DC382D",
          },
        },
        {
          skillName: "ORM",
          fontAwesomeClassname: "simple-icons:typeorm",
          style: {
            color: "#E0234E",
          },
        },
        {
          skillName: "GraphQL",
          fontAwesomeClassname: "simple-icons:graphql",
          style: {
            color: "#092E20",
          },
        },
        {
          skillName: "NPM",
          fontAwesomeClassname: "simple-icons:npm",
          style: {
            color: "#CB3837",
          },
        },
      ],
    },
    {
      title: "DevOps & Cloud Infra",
      fileName: "CloudInfraImg",
      skills: [
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining websites on virtual machine instances along with integration of databases",
        "⚡ Setting up streaming jobs from DB to Server or vice-versa on GCP and AWS",
        "⚡ Setting up CI/CD pipelines using Jenkins, GitHub Actions, etc.",
      ],
      softwareSkills: [
        {
          skillName: "GitHub",
          fontAwesomeClassname: "simple-icons:github",
          style: {
            color: "#181717",
          },
        },
        {
          skillName: "Linux",
          fontAwesomeClassname: "simple-icons:linux",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "NGINX",
          fontAwesomeClassname: "simple-icons:nginx",
          style: {
            color: "#269539",
          },
        },
        {
          skillName: "GCP",
          fontAwesomeClassname: "simple-icons:googlecloud",
          style: {
            color: "#4285F4",
          },
        },
        {
          skillName: "AWS",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            color: "#0089D6",
          },
        },
        {
          skillName: "Firebase",
          fontAwesomeClassname: "simple-icons:firebase",
          style: {
            color: "#FFCA28",
          },
        },

        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            color: "#1488C6",
          },
        },
      ],
    },
    {
      title: "Blockchain & Web3",
      fileName: "BlockchainImg",
      skills: [
        "⚡ Building and deploying blockchain smart contracts using Solidity",
        "⚡ Developing decentralized applications (DApps) using React and Next.js",
        "⚡ Creating the flow of application functionalities to optimize user experience",
      ],
      softwareSkills: [
        {
          skillName: "Blockchain",
          fontAwesomeClassname: "simple-icons:blockchaindotcom",
          style: {
            color: "#121D33",
          },
        },
        {
          skillName: "Bitcoin",
          fontAwesomeClassname: "simple-icons:bitcoin",
          style: {
            color: "#F7931A",
          },
        },
        {
          skillName: "Ethereum",
          fontAwesomeClassname: "simple-icons:ethereum",
          style: {
            color: "#3C3C3D",
          },
        },
        {
          skillName: "Web3",
          fontAwesomeClassname: "simple-icons:web3dotjs",
          style: {
            color: "#F16822",
          },
        },
        {
          skillName: "Solidity",
          fontAwesomeClassname: "simple-icons:solidity",
          style: {
            color: "#363636",
          },
        },
        {
          skillName: "Hardhat",
          fontAwesomeClassname: "simple-icons:opensourcehardware",
          style: {
            color: "#0099B0",
          },
        },
      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [
    {
      siteName: "LeetCode",
      iconifyClassname: "simple-icons:leetcode",
      style: {
        color: "#F79F1B",
      },
      profileLink: "https://leetcode.com/layman_brother/",
    },
    {
      siteName: "HackerRank",
      iconifyClassname: "simple-icons:hackerrank",
      style: {
        color: "#2EC866",
      },
      profileLink: "https://www.hackerrank.com/layman_brother",
    },
    {
      siteName: "Codechef",
      iconifyClassname: "simple-icons:codechef",
      style: {
        color: "#5B4638",
      },
      profileLink: "https://www.codechef.com/users/ashutosh_1919",
    },
    {
      siteName: "Codeforces",
      iconifyClassname: "simple-icons:codeforces",
      style: {
        color: "#1F8ACB",
      },
      profileLink: "http://codeforces.com/profile/layman_brother",
    },
    {
      siteName: "Hackerearth",
      iconifyClassname: "simple-icons:hackerearth",
      style: {
        color: "#323754",
      },
      profileLink: "https://www.hackerearth.com/@ashutosh391",
    },
    {
      siteName: "Kaggle",
      iconifyClassname: "simple-icons:kaggle",
      style: {
        color: "#20BEFF",
      },
      profileLink: "https://www.kaggle.com/laymanbrother",
    },
  ],
};

const degrees = {
  degrees: [
    {
      title: "University of San Francisco",
      subtitle: "Bachelor of Science in Computer Science",
      logo_path: "University_San_Francisco_logo.png",
      alt_name: "University of San Francisco",
      duration: "2013 - 2017",
      descriptions: [
        "⚡ I studied core computer science subjects including Data Structures, Algorithms, Database Systems, Operating Systems, Computer Architecture, and Artificial Intelligence, which built a strong foundation in software engineering and system design.",
        "⚡ Along with academic coursework, I developed practical skills in full-stack development, cloud computing, and modern web technologies, applying them through various academic and personal projects",
        "⚡ During my studies, I actively worked on programming projects and collaborative assignments that helped me strengthen my problem-solving abilities, software architecture understanding, and real-world development skills.",
      ],
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "",
  description:
    "I have worked with several startups and growing companies as a Senior Full-Stack Developer, building web platforms, mobile applications, and automation systems.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Senior Full-Stack Developer",
          company: "SEO Global",
          logo_path: "seoglobal_logo.png",
          duration: "Feb 2023 - Present",
          location: "Dover, DE, US",
          description:
            "Led the development of scalable SaaS platforms by designing full-stack architectures, building secure APIs, optimizing PostgreSQL databases, and managing cloud deployments using modern technologies like Next.js, Node.js/Django, and Docker.",
          color: "#000000",
        },
        {
          title: "Full-Stack Developer",
          company: "DevOrion",
          logo_path: "devorion_logo.png",
          duration: "Oct 2019 - Jan 2023",
          location: "San Jose, CA, US",
          description:
            "Developed full-stack SaaS and business applications using Angular, .NET, and MongoDB, while implementing secure REST APIs, Stripe payment integrations, and automation tools to streamline business workflows.",
          color: "#0879bf",
        },
        {
          title: "Web Developer",
          company: "ScienceSoft",
          logo_path: "sciencesoft_logo.png",
          duration: "May 2017 - Sept 2019",
          location: "Mckinney, TX, US",
          description:
            "Built responsive web applications and mobile apps using modern JavaScript technologies, while developing backend services, integrating CMS systems, and supporting deployment and system modernization for client platforms.",
          color: "#9b1578",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "My projects make use of a wide range of modern technologies and development tools. I have strong experience building full-stack web platforms, mobile applications, and automation systems, and deploying them to scalable cloud infrastructure to ensure reliability and performance.",
  avatar_image_path: "projects_image.svg",
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: "animated_ashutosh.png",
    description:
      "Please feel free to message me, and I will respond within 24 hours. I’d be glad to help.",
  },
  blogSection: {
    title: "Blogs",
    subtitle:
      "I like to document some of my experiences from my professional career journey, as well as share technical knowledge.",
    link: "https://blogs.danieljin.info/",
    avatar_image_path: "blogs_image.svg",
  },
  addressSection: {
    title: "Address",
    subtitle: "8 The Green, Suite B, Dover, Delaware, US 19901",
    locality: "Dover",
    country: "USA",
    region: "Delaware",
    postalCode: "19901",
    streetAddress: "8 The Green, Suite B",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://www.google.com/maps/place/8+The+Green+Suite+B,+Dover,+DE+19910,+USA/@39.1558761,-75.5270836,17z/data=!3m2!4b1!5s0x89c764aba877ecef:0x43c53f8c9e24d8ff!4m6!3m5!1s0x89c764aa7c38b56d:0x1c6368e17a8edc56!8m2!3d39.155872!4d-75.5245087!16s%2Fg%2F11yrgmdtj5?entry=ttu&g_ep=EgoyMDI2MDMwNS4wIKXMDSoASAFQAw%3D%3D",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  experience,
  projectsHeader,
  contactPageData,
};

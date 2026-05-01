export const moduleInfo = {
  title: 'WebGoat Module: CIA Triad',
}

export const lessonCards = [
  {
    step: 1,
    title: 'The CIA Triad',
    paragraphs: [
      'The CIA Triad (confidentiality, integrity, availability) is a model for information security. The three elements of the triad are considered the most crucial information security components and should be guaranteed in any secure system. Serious consequences can result if even one these elements is breached.',
      'The CIA Triad was created to provide a baseline standard for evaluating and implementing security regardless of the underlying system and/or organization.',
    ],
  },
  {
    step: 2,
    title: 'Confidentiality',
    paragraphs: [
      'Confidentiality is "the property, that information is not made available or disclosed to unauthorized individuals, entities, or processes." In other words, confidentiality requires that unauthorized users should not be able to access sensitive resources. Confidentiality must be balanced with availability; authorized persons must still be able to access the resources they have been granted permissions for.',
      'Although confidentiality is similar to "privacy", these two words are not interchangeable. Rather, confidentiality is a component of privacy; confidentiality is implemented to protect resources from unauthorized entities.',
    ],
    bulletSections: [
      {
        heading: 'Examples that compromise confidentiality:',
        items: [
          'a hacker gets access to the password database of a company',
          'a sensitive emails is sent to the incorrect individual',
          'a hacker reads sensitive information by intercepting and eavesdropping on an information transfer',
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'Integrity',
    paragraphs: [
      'Integrity is "the property of accuracy and completeness." In other words, integrity means maintaining the consistency, accuracy and trustworthiness of data over its entire life cycle. Data must not be changed during transit and unauthorized entities should not be able to alter the data.',
    ],
    bulletSections: [
      {
        heading: 'Examples that compromise integrity:',
        items: [
          'human error when entering data',
          'errors during data transmission',
          'software bugs and hardware failures',
          'hackers change information that they should not have access to',
        ],
      },
      {
        heading: 'Examples of methods ensuring integrity',
        items: [
          'well functioning authentication methods and access control',
          'checking integrity with hash functions',
          'backups and redundancy',
          'auditing and logging',
        ],
      },
    ],
  },
  {
    step: 4,
    title: 'Availability',
    paragraphs: [
      'Availability is "the property of being accessible and usable on demand by an authorized entity." In other words, authorized persons should have access to permitted resources at all times.',
    ],
    bulletSections: [
      {
        heading: 'Examples that compromise availability:',
        items: [
          'denial-of-service attacks (DOS)',
          'hardware failures',
          'fire or other natural disasters',
          'software or network misconfigurations',
        ],
      },
      {
        heading: 'Examples of methods ensuring availability',
        items: [
          'intrusion detection systems (IDSs)',
          'network traffic control',
          'firewalls',
          'physical security of hardware and underlying infrastructure',
          'protections against fire, water, and other elements',
          'hardware maintenance',
          'redundancy',
        ],
      },
    ],
  },
  {
    step: 5,
    title: 'Quiz',
    intro:
      "Now it's time for a quiz! Answer the following question to check if you understood the topic.",
    description:
      'Today, most systems are protected by a firewall. A properly configured firewall can prevent malicious entities from accessing a system and helps protect an organization\'s resources. For this quiz, imagine a system that handles personal data but is not protected by a firewall!',
    questions: [
      {
        number: 1,
        question: 'How could an intruder harm the security goal of confidentiality?',
        options: [
          'A: By deleting all the databases.',
          'B: By stealing a database where general configuration information for the system is stored.',
          'C: By stealing a database where names and emails are stored and uploading it to a website.',
          "D: Confidentiality can't be harmed by an intruder.",
        ],
      },
      {
        number: 2,
        question: 'How could an intruder harm the security goal of integrity?',
        options: [
          'A: By changing the names and emails of one or more users stored in a database.',
          'B: By listening to incoming and outgoing network traffic.',
          'C: By bypassing the access control mechanisms used to manage database access.',
          'D: Integrity can only be harmed when the intruder has physical access to the database.',
        ],
      },
      {
        number: 3,
        question: 'How could an intruder harm the security goal of availability?',
        options: [
          'A: By exploiting a software bug that allows the attacker to bypass the normal authentication mechanisms for a database.',
          'B: By redirecting sensitive emails to other individuals.',
          'C: Availability can only be harmed by unplugging the power supply of the storage devices.',
          'D: By launching a denial of service attack on the servers.',
        ],
      },
      {
        number: 4,
        question: 'What happens if at least one of the CIA security goals is harmed?',
        options: [
          "A: All three goals must be harmed for the system's security to be compromised; harming just one goal has no effect on the system's security.",
          "B: The system's security is compromised even if only one goal is harmed.",
          "C: It is acceptable if an attacker reads or changes data since at least some of the data is still available. The system's security is compromised only if its availability is harmed.",
          "D: It is acceptable if an attacker changes data or makes it unavailable, but reading sensitive data is not tolerable. The system's security is compromised only if its confidentiality is harmed.",
        ],
      },
    ],
  },
]

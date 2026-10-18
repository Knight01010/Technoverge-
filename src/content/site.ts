// Site copy, extracted from the approved design prototype.

export const CLOCK: [string, number][] = [['Mon 06:44', 1], ['Tue 03:12', 2], ['Tue 09:02', 3], ['Tue 09:08', 4], ['Tue 11:30', 5], ['Tue 18:00', 6]];

export const SIGNS: [string, string][] = [
      ['The sender', 'A freight company you know, sending from a look-alike domain registered three days ago.'],
      ['The pressure', 'Shipment on hold, charges if you don’t pay today. Urgency is there to stop you checking.'],
      ['The link', 'The button says “View invoice”. It goes to a sign-in page that is not yours.']
    ];

export const FLOWS: [string, string, string, string, string, "ok" | "deny"][] = [
      ['Finance laptop → plant controller', 'Office → Control, direct', 'Denied', 'The IT/OT firewall has no rule allowing office devices to reach controllers. The attempt is blocked and logged, which is what alerted the security team.', 'M125 140 C 300 140, 420 140, 552 140', 'deny'],
      ['Production data → office reports', 'Control → DMZ copy → Office', 'Allowed, one way', 'The plant historian pushes a copy into the DMZ. Office users read the copy and never touch the control network itself.', 'M695 120 C 600 110, 520 110, 410 120 C 300 130, 230 130, 125 125', 'ok'],
      ['Vendor remote support', 'Internet → DMZ jump host → Control', 'Allowed with approval', 'Vendors connect to one jump host, with multi-factor sign-in, a time window approved by operations and every session recorded.', 'M125 285 C 260 285, 330 230, 410 160 C 500 90, 600 100, 695 135', 'ok']
    ];

export const STEPS2: [string, string, string, string, string][] = [
      ['Mon 06:44', 'Link opened', 'A phishing link was opened on the Finance laptop FIN-LT-061.', 'Email security, which flagged the sender and logged the click.', 'Click tracking from email security sent to the SIEM.'],
      ['Tue 03:12', 'Sign-in blocked', 'Someone used the stolen password on the VPN from outside the GCC.', 'Identity platform, which blocked it for missing multi-factor approval.', 'A rule that alerts on blocked sign-ins after a phishing click.'],
      ['Tue 09:02', 'Plant scanned', 'The laptop tried 41 connections to controllers in the plant.', 'The IT/OT firewall, which denied every one.', 'OT firewall logs connected, with an alert for any office-to-plant attempt.'],
      ['Tue 09:08', 'Case opened', 'The three signals were linked to one user and one laptop.', 'The refinery’s security analyst, 6 minutes after the scan began.', 'Correlation rules that join email, identity and OT events.'],
      ['Tue 09:10', 'Laptop isolated', 'The laptop was cut off from the network with one action.', 'The analyst, following the phishing playbook.', 'Endpoint isolation wired into the playbook, rehearsed in drills.'],
      ['Tue 11:30', 'Back to work', 'Password reset, device rebuilt, user back online. Report written.', 'IT and the security team together.', 'Recovery steps and a report template agreed before any incident.']
    ];

export const LIFE: [string, string, string][] = [['Discover', 'Workshops to map your sites, systems and the honest state of your defences.', 'loupe'], ['Assess', 'Exposure, segmentation and detection gaps scored against your risks.', 'sieve'], ['Roadmap', 'A sequenced plan with business cases attached.', 'branches'], ['Implement', 'Controls built alongside your teams, around operations.', 'cabinet'], ['Secure', 'Monitoring and playbooks wired in from day one.', 'padlock'], ['Operate', 'Measured outcomes. Then back to discovery.', 'dish']];

export const IND: [string, string, number][] = [
      ['Oil & Gas', 'Refineries, field sites and control systems that can never go down.', 2],
      ['Banking', 'Strict regulators, zero tolerance for downtime and attackers who never stop.', 0],
      ['Healthcare', 'Patient data, connected medical devices and clinics that never close.', 3],
      ['Manufacturing', 'Factory systems newly connected to IT, and legacy machines you can’t replace.', 1],
      ['Education', 'Campuses full of devices, and staff and students ready to learn AI safely.', 4],
      ['SMBs', 'Enterprise-grade security, sized for a growing business.', -1]
    ];

export const CASES: { sector: string; region: string; title: string; tabs: string[][] }[] = [
      { sector: 'Banking and financial services', region: 'GCC', title: 'Strengthening cyber resilience for a leading financial institution',
        tabs: [['Fragmented security tools with limited visibility', 'Gaps in real-time detection and response', 'Inconsistent identity and access practices', 'Rising regulatory pressure and third-party risk'],
          ['Security posture assessment against frameworks and regulators', 'Modernised SOC monitoring and SIEM integration', 'IAM and privileged access overhaul', 'Governance, tabletop exercises and staff training'],
          ['Stronger threat detection and response', 'Smaller attack surface on critical systems', 'Improved regulatory alignment', 'Higher security awareness across the institution']] },
      { sector: 'Manufacturing', region: 'GCC', title: 'Securing IT/OT convergence for a manufacturer',
        tabs: [['OT newly connected to enterprise IT', 'Limited visibility into industrial control systems', 'Risk of threats moving laterally from IT to OT', 'Legacy machines with no native security'],
          ['Converged IT/OT risk assessment and asset discovery', 'Zone-and-conduit segmentation between IT and OT', 'Compensating controls for legacy systems', 'OT-specific monitoring and joint IT/OT training'],
          ['Zero disruption to production during the rollout', 'Clear visibility across IT and OT', 'Lateral movement sharply restricted', 'Legacy systems protected without replacement']] },
      { sector: 'Oil & Gas', region: 'Middle East', title: 'Reimagining network infrastructure for a regional energy leader',
        tabs: [['Fragmented network across sites with inconsistent standards', 'Latency on real-time data from remote facilities', 'Aging hardware near end-of-life, raising outage risk', 'Little visibility for troubleshooting and capacity planning'],
          ['Full audit of traffic, bottlenecks and single points of failure', 'One standard architecture with redundant paths for critical links', 'Phased rollout by site criticality, piloted first', 'Centralised monitoring across the whole environment'],
          ['Significantly less unplanned downtime across sites', 'Real-time connectivity between field and central operations', 'Proactive issue resolution through visibility', 'A scalable base for digital and automation work']] },
      { sector: 'Healthcare', region: 'Middle East', title: 'Advancing infrastructure and security for a regional healthcare provider',
        tabs: [['Aging infrastructure creating reliability risk', 'Little segmentation between clinical, admin and device networks', 'Sensitive patient data and growing privacy rules', 'Zero tolerance for downtime in 24/7 care'],
          ['Assessment against healthcare best practice and regulation', 'Core network, server and storage modernisation', 'Segmentation isolating clinical systems and medical devices', 'Changes scheduled around clinical hours'],
          ['Uninterrupted clinical operations', 'Patient data protected by segmentation and encryption', 'Reduced risk from connected devices', 'A secure base for digital health services']] },
      { sector: 'Education', region: 'GCC', title: 'AI training and workshops for an education institution',
        tabs: [['[Challenge to be written from the engagement]'], ['[Approach: workshop format, audiences and topics]'], ['[Outcome: real results only]']] }
    ];


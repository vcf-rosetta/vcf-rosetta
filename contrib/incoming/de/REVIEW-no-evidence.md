# de 机翻:缺库内依据的条目(人工复核队列)

由 `node contrib/flag-unsupported.mjs de --max-hits 2` 生成,可复现。

判定:该条目英文键里的**所有**实词在 `glossary.de.json` 的英文键中命中数都 <= 2,
即完全没有库内先例可依,译文只能靠推断。

**这不是「翻错了」的清单,是「无据可依」的清单。** VCF 9 的新概念必然落在这里 ——
官方 8.0 语言包里没有这些词,只能等有母语运维实际看到界面才能定。

共 759 条。

| 批次 | 英文 | 当前译文 | 实词命中数 |
|---|---|---|---|
| short-001 | (Auto-assign) | (Automatisch zuweisen) | Auto-assign:0 |
| short-001 | 3D Renderer | 3D-Renderer | Renderer:1 |
| short-001 | ABX | ABX | ABX:0 |
| long-001 | Active-Active (Tier-0) | Aktiv-Aktiv (Tier-0) | Active-Active:0, Active-Active Tier-0:0, Tier-0:0 |
| short-001 | Active-Standby (LB) | Aktiv-Standby (LB) | Active-Standby:0, Active-Standby LB:0 |
| long-001 | Active-Standby (Tier-0) | Aktiv-Standby (Tier-0) | Active-Standby:0, Active-Standby Tier-0:0, Tier-0:0 |
| short-001 | Add a GRE Tunnel | GRE-Tunnel hinzufügen | Tunnel:2, GRE:1, GRE Tunnel:0 |
| short-002 | Add BGP Neighbor | BGP-Nachbarn hinzufügen | BGP:0, BGP Neighbor:0, Neighbor:0 |
| short-002 | Add Criterion | Kriterium hinzufügen | Criterion:0 |
| long-001 | Add Edge (to cluster) | Edge hinzufügen (zum Cluster) | Edge:2 |
| short-002 | Add Edge VM | Edge-VM hinzufügen | Edge:2, Edge VM:1 |
| short-002 | Add IP Ranges | IP-Bereiche hinzufügen | Ranges:2 |
| short-002 | Add OSPF | OSPF hinzufügen | OSPF:0 |
| short-003 | Add Scenario | Szenario hinzufügen | Scenario:2 |
| short-003 | Add to Favorites | Zu Favoriten hinzufügen | Favorites:0 |
| short-003 | Add VPC | VPC hinzufügen | VPC:1 |
| short-003 | Add Widget | Widget hinzufügen | Widget:0 |
| short-003 | Add-on license | Add-On-Lizenz | Add-on:0 |
| short-003 | Administrators | Administratoren | Administrators:1 |
| long-002 | Administrators who manage the trusted hosts | Administratoren, die die vertrauenswürdigen Hosts verwalten | Administrators:1 |
| short-003 | Advertise | Ankündigen | Advertise:0 |
| short-003 | Aggressive | Aggressiv | Aggressive:1 |
| long-002 | All Apps Organizations | Alle App-Organisationen | Apps:0, Apps Organizations:0, Organizations:0 |
| short-004 | All Dashboards | Alle Dashboards | Dashboards:2 |
| short-004 | All Deployments | Alle Bereitstellungen | Deployments:2 |
| short-004 | All Projects | Alle Projekte | Projects:1 |
| short-004 | ALUA | ALUA | ALUA:1 |
| short-004 | Anomalies | Anomalien | Anomalies:0 |
| short-004 | Ansible Tower | Ansible Tower | Ansible:0, Ansible Tower:0, Tower:0 |
| short-004 | Antrea | Antrea | Antrea:0 |
| short-004 | Antrea Egress | Antrea Egress | Egress:2, Antrea:0, Antrea Egress:0 |
| long-002 | Antrea Egress (group) | Antrea Egress (Gruppe) | Egress:2, Antrea:0, Antrea Egress:0 |
| short-005 | Applied-To | Angewendet auf | Applied-To:0 |
| short-005 | Approval policy | Genehmigungsrichtlinie | Approval:0 |
| short-005 | Approval type | Genehmigungstyp | Approval:0 |
| short-005 | Approvals page | Seite „Genehmigungen“ | Approvals:0 |
| short-005 | Approve | Genehmigen | Approve:0 |
| long-002 | Approved (recommendation) | Genehmigt (Empfehlung) | Approved:1 |
| short-005 | Approver | Genehmiger | Approver:0 |
| short-005 | Approver mode | Genehmigermodus | Approver:0 |
| short-005 | Approver role | Genehmigerrolle | Approver:0 |
| short-005 | Approvers | Genehmiger | Approvers:0 |
| short-005 | Apr | Apr. | Apr:1 |
| short-005 | APR | APR | APR:1 |
| short-005 | April | April | April:0 |
| short-005 | Aria Suite | Aria Suite | Suite:1, Aria:0, Aria Suite:0 |
| short-005 | Arrange Horizontally | Horizontal anordnen | Arrange:0, Arrange Horizontally:0, Horizontally:0 |
| short-005 | Arrange Vertically | Vertikal anordnen | Arrange:0, Arrange Vertically:0, Vertically:0 |
| long-003 | Array-based replication | Array-basierte Replizierung | Array-based:0 |
| long-003 | Array-based replication protection group | Schutzgruppe für Array-basierte Replizierung | Array-based:0 |
| short-005 | ASN | ASN | ASN:1 |
| short-005 | AssociateMachine | AssociateMachine | AssociateMachine:0 |
| short-005 | ATP | ATP | ATP:0 |
| short-005 | Attacker IP | Angreifer-IP | Attacker:0, Attacker IP:0 |
| short-005 | Attested by | Nachgewiesen von | Attested:1 |
| short-006 | Aug | Aug. | Aug:0 |
| short-006 | August | August | August:0 |
| short-006 | Authoring | Erstellung | Authoring:0 |
| short-006 | Auto-detect settings | Einstellungen automatisch erkennen | Auto-detect:0 |
| short-006 | Auto-expand | Automatisch erweitern | Auto-expand:0 |
| long-003 | Auto-generate my passwords | Meine Kennwörter automatisch generieren | Auto-generate:0 |
| long-003 | Auto-generate my passwords for newly installed appliances | Meine Kennwörter für neu installierte Appliances automatisch generiere | Auto-generate:0 |
| long-003 | Auto-generate passwords for appliances | Kennwörter für Appliances automatisch generieren | Auto-generate:0 |
| long-003 | Auto-include new disks in replication | Neue Festplatten automatisch in die Replizierung einbeziehen | Auto-include:0 |
| short-006 | Auto-login count | Anzahl der automatischen Anmeldungen | Auto-login:0 |
| short-006 | Auto-negotiate | Automatische Aushandlung | Auto-negotiate:1 |
| short-006 | Auto-renewal | Automatische Erneuerung | Auto-renewal:0 |
| short-006 | Auto-renewal status | Status der automatischen Erneuerung | Auto-renewal:0 |
| short-006 | Auto-rotation | Automatische Rotation | Auto-rotation:2 |
| short-006 | Auto-Update | Automatisches Update | Auto-Update:1 |
| long-003 | Autogenerated (wrapping key) | Automatisch generiert (Wrapping-Schlüssel) | Autogenerated:1 |
| short-006 | Automap (SNAT) | Automap (SNAT) | Automap:0, Automap SNAT:0, SNAT:0 |
| short-006 | AUTOMATE | AUTOMATISIEREN | AUTOMATE:0 |
| short-006 | Back-up | Sicherung | Back-up:0 |
| short-006 | Badge | Badge | Badge:0 |
| short-006 | Badge (widget) | Badge (Widget) | Badge:0 |
| short-006 | Bare Metal | Bare Metal | Bare:1, Bare Metal:1, Metal:1 |
| short-006 | Bare Metal (edge) | Bare Metal (Edge) | Bare:1, Bare Metal:1, Metal:1 |
| short-006 | Bash shell | Bash-Shell | Bash:2 |
| short-006 | Bcc Recipients | BCC-Empfänger | Bcc:0, Bcc Recipients:0, Recipients:0 |
| short-006 | BFD | BFD | BFD:0 |
| short-006 | BFD (BGP) | BFD (BGP) | BFD:0, BFD BGP:0, BGP:0 |
| short-006 | BFD (OSPF) | BFD (OSPF) | BFD:0, BFD OSPF:0, OSPF:0 |
| short-006 | BFD (static route) | BFD (statische Route) | BFD:0 |
| short-006 | BFD Multiplier | BFD-Multiplikator | Multiplier:2, BFD:0, BFD Multiplier:0 |
| short-007 | BGP | BGP | BGP:0 |
| short-007 | BGP (routing) | BGP (Routing) | BGP:0 |
| short-007 | BGP EVPN | BGP EVPN | BGP:0, BGP EVPN:0, EVPN:0 |
| short-007 | BGP Multi-hop | BGP-Multi-Hop | BGP:0, BGP Multi-hop:0, Multi-hop:0 |
| short-007 | BGP Neighbor | BGP-Nachbar | BGP:0, BGP Neighbor:0, Neighbor:0 |
| short-007 | BGP Neighbors | BGP-Nachbarn | BGP:0, BGP Neighbors:0, Neighbors:0 |
| long-003 | BGP Neighbors (Tier-0) | BGP-Nachbarn (Tier-0) | BGP:0, BGP Neighbors:0, Neighbors:0 |
| short-007 | Bill of Materials | Stückliste | Bill:1, Materials:0 |
| short-007 | Bills | Rechnungen | Bills:0 |
| short-007 | Bindings | Bindungen | Bindings:1 |
| short-007 | Binpack | Binpack | Binpack:0 |
| long-003 | BlueField RShim driver | BlueField RShim-Treiber | BlueField:0, BlueField RShim:0, RShim:0 |
| short-007 | Blueprint | Blueprint | Blueprint:0 |
| long-003 | Blueprint (automation) | Blueprint (Automatisierung) | Blueprint:0 |
| short-007 | Blueprints | Blueprints | Blueprints:0 |
| short-007 | BMCNetworkEnable | BMCNetworkEnable | BMCNetworkEnable:0 |
| short-007 | BOM | BOM | BOM:0 |
| short-007 | Boolean | Boolescher Wert | Boolean:1 |
| short-007 | Breadcrumb | Breadcrumb | Breadcrumb:0 |
| short-007 | Bring-Up | Inbetriebnahme | Bring-Up:0 |
| short-007 | Bringup | Inbetriebnahme | Bringup:0 |
| short-007 | BRS | BRS | BRS:0 |
| short-007 | Budgeting | Budgetierung | Budgeting:0 |
| short-007 | Bulk actions | Massenaktionen | Bulk:0 |
| short-007 | C-Series vGPU | vGPU der C-Serie | C-Series:0 |
| short-007 | C-states | C-States | C-states:1 |
| short-007 | Callout step | Callout-Schritt | Callout:0 |
| short-007 | Campaign | Kampagne | Campaign:0 |
| short-008 | Cancellable | Abbrechbar | Cancellable:1 |
| short-008 | Canvas | Canvas | Canvas:0 |
| short-008 | Cc Recipients | CC-Empfänger | Recipients:0 |
| short-008 | CDP | CDP | CDP:0 |
| long-004 | Cell value has been edited | Zellenwert wurde bearbeitet | Cell:2 |
| long-004 | Centralized (network connectivity) | Zentralisiert (Netzwerkkonnektivität) | Centralized:1 |
| long-004 | Centralized connection | Zentralisierte Verbindung | Centralized:1 |
| long-004 | Centralized log collection | Zentralisierte Protokollerfassung | Centralized:1 |
| short-008 | cert-manager (VKS) | cert-manager (VKS) | VKS:0 |
| short-008 | Chargeback | Chargeback | Chargeback:0 |
| short-008 | Chassis ID | Gehäuse-ID | Chassis:1, Chassis ID:0 |
| long-004 | Check-pointing (Orchestrator) | Prüfpunktsetzung (Orchestrator) | Orchestrator:1, Check-pointing:0, Check-pointing Orchestrator:0 |
| short-008 | Checkbox (form) | Kontrollkästchen (Formular) | Checkbox:2 |
| long-004 | Checklist (commission) | Prüfliste (Inbetriebnahme) | Checklist:2 |
| short-008 | CIFS | CIFS | CIFS:1 |
| short-009 | ClusterBootstrap | ClusterBootstrap | ClusterBootstrap:0 |
| short-009 | Collapse All | Alle reduzieren | Collapse:2, Collapse All:1 |
| short-009 | Combined | Kombiniert | Combined:2 |
| short-009 | Comments (GFW rule) | Kommentare (GFW-Regel) | Comments:0, Comments GFW:0, GFW:0 |
| short-009 | Commission | In Betrieb nehmen | Commission:0 |
| short-009 | Commission button | Schaltfläche „In Betrieb nehmen“ | Commission:0 |
| short-009 | Commissioning | Inbetriebnahme | Commissioning:0 |
| short-009 | Committed Projects | Übernommene Projekte | Committed:1, Projects:1, Committed Projects:0 |
| short-009 | Committed Scenarios | Übernommene Szenarien | Committed:1, Scenarios:1, Committed Scenarios:0 |
| short-009 | CommunitySupported | CommunitySupported | CommunitySupported:1 |
| long-005 | Condition-based alarm | Bedingungsbasierter Alarm | Condition-based:0 |
| long-005 | Confidential computing | Confidential Computing | Confidential:0 |
| long-006 | ConnectionTrack module | ConnectionTrack-Modul | ConnectionTrack:0 |
| short-010 | Consent checkbox | Einwilligungs-Kontrollkästchen | Consent:0 |
| short-010 | Conservative | Konservativ | Conservative:2 |
| long-006 | Continuous optimization | Kontinuierliche Optimierung | Continuous:2 |
| short-011 | Contour (ingress) | Contour (Ingress) | Contour:0 |
| long-006 | Converge existing vSphere | Vorhandenes vSphere konvergieren | Converge:1 |
| short-011 | Converge to VCF | Zu VCF konvergieren | Converge:1, VCF:0 |
| short-011 | Convergence wizard | Konvergenzassistent | Convergence:0 |
| short-011 | CoreDNS | CoreDNS | CoreDNS:0 |
| short-011 | Corrective action | Korrekturmaßnahme | Corrective:0 |
| short-012 | Creator | Ersteller | Creator:0 |
| short-012 | CRI | CRI | CRI:0 |
| short-012 | Criterion | Kriterium | Criterion:0 |
| short-012 | Criticality | Kritikalität | Criticality:0 |
| short-012 | Criticality (alert) | Kritikalität (Warnung) | Criticality:0 |
| long-007 | Cross-vSwitch vMotion | vSwitch-übergreifendes vMotion | Cross-vSwitch:0 |
| short-012 | Crown Jewels | Kritische Ressourcen | Crown:0, Crown Jewels:0, Jewels:0 |
| short-012 | CTGW | CTGW | CTGW:0 |
| short-012 | CVSS | CVSS | CVSS:0 |
| short-012 | Dashboards | Dashboards | Dashboards:2 |
| long-007 | Dashboards and Widgets | Dashboards und Widgets | Dashboards:2, Widgets:0 |
| short-013 | DbA | dBA | DbA:1 |
| short-013 | DbC | DbC | DbC:0 |
| long-007 | DBHealthStatusClearEvent | DBHealthStatusClearEvent | DBHealthStatusClearEvent:0 |
| long-007 | DBHealthStatusErrorEvent | DBHealthStatusErrorEvent | DBHealthStatusErrorEvent:0 |
| long-007 | DBHealthStatusWarningEvent | DBHealthStatusWarningEvent | DBHealthStatusWarningEvent:0 |
| short-013 | Decision (workflow) | Entscheidung (Workflow) | Decision:0 |
| short-014 | Deployments | Bereitstellungen | Deployments:2 |
| long-008 | Deployments (automation) | Bereitstellungen (Automatisierung) | Deployments:2 |
| short-014 | Design | Design | Design:2 |
| short-014 | Design (menu) | Design (Menü) | Design:2 |
| short-014 | Design Canvas | Design-Zeichenfläche | Design:2, Design Canvas:0, Canvas:0 |
| short-014 | Design canvas | Design-Zeichenfläche | Design:2 |
| short-014 | Design page | Design-Seite | Design:2 |
| short-014 | Destinations | Ziele | Destinations:0 |
| long-008 | Destinations (firewall rule) | Ziele (Firewallregel) | Destinations:0 |
| long-008 | Destinations (port mirror) | Ziele (Portspiegelung) | Destinations:0 |
| short-014 | DGData | DGData | DGData:0 |
| short-014 | DHCPv4 | DHCPv4 | DHCPv4:0 |
| short-014 | DISA | DISA | DISA:0 |
| short-015 | Dismiss | Verwerfen | Dismiss:2 |
| short-015 | Dismiss alert | Warnung verwerfen | Dismiss:2 |
| short-015 | DLB (distributed LB) | DLB (verteilter LB) | DLB:0 |
| short-015 | DNAT | DNAT | DNAT:0 |
| short-015 | DNAT (VPC) | DNAT (VPC) | VPC:1, DNAT:0, DNAT VPC:0 |
| long-009 | Do not change. This is VCF reserved group. | Nicht ändern. Dies ist eine für VCF reservierte Gruppe. | VCF:0 |
| short-015 | Doorbell | Doorbell | Doorbell:1 |
| short-015 | Downlink | Downlink | Downlink:0 |
| short-015 | DPortGroup-EDGE-TEP | DPortGroup-EDGE-TEP | DPortGroup-EDGE-TEP:0 |
| long-009 | DPortGroup-EDGE-UPLINK | DPortGroup-EDGE-UPLINK | DPortGroup-EDGE-UPLINK:0 |
| short-015 | DPortGroup-MGMT | DPortGroup-MGMT | DPortGroup-MGMT:0 |
| short-015 | DPortGroup-VSAN | DPortGroup-VSAN | DPortGroup-VSAN:0 |
| short-016 | DTGW | DTGW | DTGW:0 |
| short-016 | E1000E | E1000E | E1000E:0 |
| short-016 | E1000e | E1000e | E1000e:0 |
| short-016 | East-West | Ost-West | East-West:0 |
| short-016 | ECDSA | ECDSA | ECDSA:0 |
| short-016 | ECMP | ECMP | ECMP:0 |
| short-016 | ECMP (Tier-0) | ECMP (Tier-0) | ECMP:0, ECMP Tier-0:0, Tier-0:0 |
| short-016 | Edge Bridges | Edge-Bridges | Edge:2, Edge Bridges:0, Bridges:0 |
| short-016 | Edge Bridging | Edge-Bridging | Edge:2, Bridging:2, Edge Bridging:0 |
| short-016 | Edge TEP IP | Edge-TEP-IP | Edge:2, Edge TEP:0, TEP:0 |
| short-017 | EDP | EDP | EDP:0 |
| short-017 | EFI | EFI | EFI:2 |
| short-017 | EFI (firmware) | EFI (Firmware) | EFI:2 |
| short-017 | EFI (host) | EFI (Host) | EFI:2 |
| short-017 | Egress | Ausgehend | Egress:2 |
| short-017 | Egress (mirroring) | Ausgehend (Spiegelung) | Egress:2 |
| short-017 | Egress (namespace) | Ausgehend (Namespace) | Egress:2 |
| short-017 | Egress CIDR | Egress-CIDR | Egress:2, Egress CIDR:0, CIDR:0 |
| long-010 | Egress traffic shaping | Egress-Traffic-Shaping | Egress:2 |
| long-010 | Elastic (port allocation) | Elastisch (Portzuteilung) | Elastic:2 |
| short-017 | Ellipsis icon | Auslassungspunktsymbol | Ellipsis:0 |
| short-017 | ELM | ELM | ELM:0 |
| short-017 | Emergency (policy) | Notfall (Richtlinie) | Emergency:2 |
| short-017 | Emergency category | Kategorie „Notfall“ | Emergency:2 |
| long-010 | Enclosure serial number | Seriennummer des Gehäuses | Enclosure:2 |
| short-018 | English | Englisch | English:0 |
| long-011 | ESXio support for single management domain. | ESXio-Unterstützung für eine einzelne Verwaltungsdomäne. | ESXio:1 |
| short-018 | Ethertype | Ethertyp | Ethertype:0 |
| short-018 | EUI | EUI | EUI:1 |
| short-018 | Event-based alarm | Ereignisbasierter Alarm | Event-based:0 |
| short-018 | Evidence | Nachweis | Evidence:0 |
| short-018 | EVPN | EVPN | EVPN:0 |
| short-018 | EVPN (nav) | EVPN (Navigation) | EVPN:0 |
| short-018 | Excellent | Ausgezeichnet | Excellent:0 |
| long-011 | Expose hardware-assisted virtualization | Hardwaregestützte Virtualisierung verfügbar machen | Expose:2 |
| short-019 | Expressions | Ausdrücke | Expressions:2 |
| short-019 | Extensibility | Erweiterbarkeit | Extensibility:1 |
| long-011 | Extensibility actions | Erweiterbarkeitsaktionen | Extensibility:1 |
| long-011 | Extensibility subscriptions | Erweiterbarkeitsabonnements | Extensibility:1 |
| long-011 | Extremely Dissatisfied | Äußerst unzufrieden | Extremely:1, Extremely Dissatisfied:0, Dissatisfied:0 |
| short-019 | Failback | Failback | Failback:0 |
| short-019 | Failback: | Failback: | Failback:0 |
| short-019 | Failedover | Failover durchgeführt | Failedover:0 |
| short-019 | Fallback | Fallback | Fallback:0 |
| short-019 | Favorite | Favorit | Favorite:0 |
| long-012 | Favorites (dashboard) | Favoriten (Dashboard) | Favorites:0 |
| long-012 | Favorites (dashboards) | Favoriten (Dashboards) | Favorites:0 |
| short-019 | Feb | Feb. | Feb:0 |
| short-019 | Federation | Federation | Federation:1 |
| short-020 | FIM | FIM | FIM:0 |
| long-012 | Final data synchronization | Abschließende Datensynchronisierung | Final:2 |
| short-020 | FinOps | FinOps | FinOps:0 |
| short-020 | FISMA | FISMA | FISMA:0 |
| short-020 | Flavor (criteria) | Flavor (Kriterium) | Flavor:1 |
| short-020 | Fleet | Fleet | Fleet:0 |
| short-020 | Fleet VM | Fleet-VM | Fleet:0, Fleet VM:0 |
| short-020 | Flexible BOM | Flexible BOM | Flexible:1, Flexible BOM:0, BOM:0 |
| short-020 | Flooded | Geflutet | Flooded:0 |
| short-020 | Flows | Flows | Flows:0 |
| short-020 | Footer | Fußzeile | Footer:0 |
| short-020 | ForceBPB | ForceBPB | ForceBPB:0 |
| short-020 | ForceMPTI | ForceMPTI | ForceMPTI:0 |
| short-020 | Forecasting | Prognose | Forecasting:0 |
| short-020 | Forecasts | Prognosen | Forecasts:0 |
| short-020 | Forged transmit | Gefälschte Übertragung | Forged:1 |
| short-020 | Forwarded | Weitergeleitet | Forwarded:0 |
| short-021 | Gauss | Gauß | Gauss:0 |
| short-021 | GeneralUser | GeneralUser | GeneralUser:0 |
| short-021 | Geneve Tunnel | Geneve-Tunnel | Tunnel:2, Geneve:0, Geneve Tunnel:0 |
| short-021 | GFW | GFW | GFW:0 |
| short-021 | GHz | GHz | GHz:1 |
| short-021 | GHz (namespace) | GHz (Namespace) | GHz:1 |
| long-012 | GitOps-Based Workflows | GitOps-basierte Workflows | GitOps-Based:0, GitOps-Based Workflows:0, Workflows:0 |
| short-021 | GM-Owned | GM-eigen | GM-Owned:0 |
| short-021 | GMSA | GMSA | GMSA:0 |
| short-021 | GPT | GPT | GPT:1 |
| short-021 | Gracefully disabled | Ordnungsgemäß deaktiviert | Gracefully:0 |
| short-021 | GRE | GRE | GRE:1 |
| short-021 | GRE Tunnel | GRE-Tunnel | Tunnel:2, GRE:1, GRE Tunnel:0 |
| short-021 | Grouping (alerts) | Gruppierung (Warnungen) | Grouping:2 |
| short-021 | GWFW | GWFW | GWFW:0 |
| short-022 | HCX | HCX | HCX:0 |
| short-022 | HCX Assisted vMotion | HCX-unterstütztes vMotion | HCX:0, HCX Assisted:0, Assisted:0 |
| short-022 | HCX Connector | HCX Connector | HCX:0, HCX Connector:0, Connector:0 |
| short-022 | HCX Interconnect | HCX Interconnect | Interconnect:1, HCX:0, HCX Interconnect:0 |
| short-022 | HCX MON | HCX MON | MON:1, HCX:0, HCX MON:0 |
| short-022 | HCX OSAM | HCX OSAM | HCX:0, HCX OSAM:0, OSAM:0 |
| short-022 | HCX RAV | HCX RAV | HCX:0, HCX RAV:0, RAV:0 |
| short-022 | HCX Tunnel | HCX-Tunnel | Tunnel:2, HCX:0, HCX Tunnel:0 |
| short-022 | HCX vMotion | HCX vMotion | HCX:0 |
| short-022 | Headroom | Spielraum | Headroom:0 |
| short-022 | HEALTHCHECK | HEALTHCHECK | HEALTHCHECK:0 |
| short-022 | Hertz | Hertz | Hertz:1 |
| short-022 | Heterogeneous vGPU | Heterogene vGPU | Heterogeneous:0 |
| long-013 | Hierarchical Inheritance | Hierarchische Vererbung | Inheritance:2, Hierarchical:0, Hierarchical Inheritance:0 |
| short-022 | High-Availability | Hochverfügbarkeit | High-Availability:0 |
| short-022 | HIPAA | HIPAA | HIPAA:0 |
| short-023 | HSP | HSP | HSP:1 |
| short-023 | HTStolenAgeThreshold | HTStolenAgeThreshold | HTStolenAgeThreshold:0 |
| short-023 | HWP | HWP | HWP:0 |
| long-013 | Identical adjacent characters | Identische benachbarte Zeichen | Identical:2 |
| short-023 | IDFW | IDFW | IDFW:0 |
| long-014 | IDFW heterogeneous group | Heterogene IDFW-Gruppe | IDFW:0 |
| long-014 | IDFW homogeneous group | Homogene IDFW-Gruppe | IDFW:0 |
| short-023 | IKE SA | IKE-SA | IKE:0, IKE SA:0 |
| short-023 | IKE-Flex | IKE-Flex | IKE-Flex:0 |
| short-023 | IKEv1 | IKEv1 | IKEv1:0 |
| short-023 | IKEv2 | IKEv2 | IKEv2:0 |
| short-024 | In (GFW direction) | Eingehend (GFW-Richtung) | GFW:0 |
| short-024 | In-Out | Eingehend/Ausgehend | In-Out:0 |
| short-024 | In-Out (direction) | Eingehend/Ausgehend (Richtung) | In-Out:0 |
| long-014 | In-product feedback (IPF) | Produktinternes Feedback (IPF) | In-product:0, IPF:0 |
| long-014 | In-product Marketplace | Produktinterner Marketplace | In-product:0, In-product Marketplace:0, Marketplace:0 |
| short-024 | In-Service | In Betrieb | In-Service:0 |
| short-024 | Industrial vSwitch | Industrieller vSwitch | Industrial:0 |
| long-014 | Informational (update type) | Information (Updatetyp) | Informational:1 |
| short-024 | Ingress | Ingress | Ingress:2 |
| short-024 | Ingress (k8s) | Ingress (k8s) | Ingress:2 |
| short-024 | Ingress (mirroring) | Ingress (Spiegelung) | Ingress:2 |
| short-024 | Ingress (namespace) | Ingress (Namespace) | Ingress:2 |
| short-024 | Ingress CIDR | Ingress-CIDR | Ingress:2, Ingress CIDR:0, CIDR:0 |
| long-014 | Ingress traffic shaping | Ingress-Traffic-Shaping | Ingress:2 |
| short-024 | Injected | Injiziert | Injected:2 |
| short-024 | Inline mode | Inline-Modus | Inline:0 |
| short-024 | Integrations | Integrationen | Integrations:0 |
| short-024 | Integrations page | Seite „Integrationen“ | Integrations:0 |
| long-014 | Intelligent alert clustering | Intelligente Warnungsgruppierung | Intelligent:0 |
| short-024 | Inter-Location | Standortübergreifend | Inter-Location:0 |
| short-024 | Intercept | Abfangen | Intercept:0 |
| short-024 | Interconnect | Interconnect | Interconnect:1 |
| short-024 | Interconnect (IX) | Interconnect (IX) | Interconnect:1, Interconnect IX:0 |
| short-025 | Intest | Im Test | Intest:0 |
| short-025 | IP Ranges | IP-Bereiche | Ranges:2 |
| short-025 | IP-HASH | IP-HASH | IP-HASH:0 |
| short-025 | IPAM | IPAM | IPAM:0 |
| short-025 | IPAM (nav) | IPAM (Navigation) | IPAM:0 |
| short-025 | IPAM (quota) | IPAM (Kontingent) | IPAM:0 |
| short-026 | iSCSI SendTargets | iSCSI-SendTargets | SendTargets:0 |
| short-026 | Jan | Jan. | Jan:0 |
| long-015 | JavaScript (Orchestrator) | JavaScript (Orchestrator) | Orchestrator:1, JavaScript:0, JavaScript Orchestrator:0 |
| short-026 | Joule | Joule | Joule:1 |
| short-026 | Jul | Jul. | Jul:0 |
| short-026 | Jun | Jun. | Jun:0 |
| short-026 | KDK | KDK | KDK:0 |
| short-026 | KHz | kHz | KHz:0 |
| short-026 | L2 VPN | L2-VPN | VPN:0 |
| short-026 | L2VPN EVPN | L2VPN EVPN | L2VPN:0, L2VPN EVPN:0, EVPN:0 |
| short-027 | Launchpad | Launchpad | Launchpad:0 |
| short-027 | LB XLarge | LB Sehr groß | XLarge:0 |
| short-027 | LCM | LCM | LCM:0 |
| short-027 | LDAPs | LDAPS | LDAPs:0 |
| short-027 | LDAPS (protocol) | LDAPS (Protokoll) | LDAPS:0 |
| short-027 | LI-TLS | LI-TLS | LI-TLS:0 |
| short-027 | Linear | Linear | Linear:1 |
| long-015 | Linking vCenter instances | Verknüpfen von vCenter-Instanzen | Linking:0 |
| short-027 | LLDP | LLDP | LLDP:0 |
| short-027 | LM and VIP (cert) | LM und VIP (Zertifikat) | VIP:1 |
| short-027 | LM-Owned | LM-eigen | LM-Owned:0 |
| short-028 | Log-based alert | Protokollbasierte Warnung | Log-based:0 |
| short-028 | Logarithmic | Logarithmisch | Logarithmic:0 |
| short-028 | Logitech Mouseman | Logitech Mouseman | Logitech:0, Logitech Mouseman:0, Mouseman:0 |
| short-028 | LTA | LTA | LTA:0 |
| short-028 | Lux | Lux | Lux:0 |
| short-029 | MaintenanceMode | Wartungsmodus | MaintenanceMode:0 |
| short-029 | Malware Prevention | Malware-Prävention | Prevention:2, Malware:1, Malware Prevention:0 |
| short-029 | Malware Verdict | Malware-Einstufung | Malware:1, Malware Verdict:0, Verdict:0 |
| short-029 | MD5 (OSPF auth) | MD5 (OSPF-Authentifizierung) | MD5:2, MD5 OSPF:0, OSPF:0 |
| short-029 | MDT | MDT | MDT:0 |
| short-029 | Megahertz | Megahertz | Megahertz:1 |
| short-030 | Micro-Segmentation | Mikrosegmentierung | Micro-Segmentation:0 |
| short-030 | Micro-segmentation | Mikrosegmentierung | Micro-segmentation:0 |
| long-017 | Micro-segmentation (OFN) | Mikrosegmentierung (OFN) | Micro-segmentation:0, Micro-segmentation OFN:0, OFN:0 |
| short-030 | Micro-Segments | Mikrosegmente | Micro-Segments:0 |
| short-030 | Mils | Mils | Mils:0 |
| short-030 | MITRE ATT&CK | MITRE ATT&CK | MITRE:0, MITRE ATT:0, ATT:0 |
| short-030 | MITRE Tactic | MITRE-Taktik | MITRE:0, MITRE Tactic:0, Tactic:0 |
| short-030 | MITRE Technique | MITRE-Technik | Technique:1, MITRE:0, MITRE Technique:0 |
| short-030 | MixedSize (vGPU) | Gemischte Größe (vGPU) | MixedSize:0 |
| short-030 | Modem | Modem | Modem:0 |
| short-030 | MON | Mo | MON:1 |
| short-030 | Motherboard model | Motherboard-Modell | Motherboard:0 |
| short-031 | MPIT | MPIT | MPIT:0 |
| short-031 | MPLS | MPLS | MPLS:0 |
| short-031 | MsgType | Meldungstyp | MsgType:0 |
| short-031 | MTEP | MTEP | MTEP:0 |
| short-031 | Multi-NIC vMotion | Multi-NIC-vMotion | Multi-NIC:0 |
| short-031 | Multi-site | Multi-Site | Multi-site:0 |
| short-031 | Multi-Tenancy | Mandantenfähigkeit | Multi-Tenancy:0 |
| short-031 | Multi-TEP | Multi-TEP | Multi-TEP:0 |
| short-031 | Multipath | Mehrfachpfad | Multipath:2 |
| short-031 | Multipath Relax | Mehrfachpfad-Lockerung | Multipath:2, Multipath Relax:0, Relax:0 |
| short-031 | Multipathing | Mehrfachpfad-Nutzung | Multipathing:1 |
| short-031 | My Deployments | Meine Bereitstellungen | Deployments:2 |
| short-031 | NAPP | NAPP | NAPP:0 |
| short-031 | Navigates to | Navigiert zu | Navigates:1 |
| long-018 | Navigates to vCenter server | Navigiert zu vCenter Server | Navigates:1 |
| short-031 | Navigator | Navigator | Navigator:0 |
| short-031 | NBS | NBS | NBS:0 |
| short-031 | NDR | NDR | NDR:0 |
| short-032 | NetworkPolicy | NetworkPolicy | NetworkPolicy:0 |
| short-032 | New VCF Fleet | Neue VCF Fleet | VCF:0, VCF Fleet:0, Fleet:0 |
| short-032 | NFS41 | NFS 4.1 | NFS41:0 |
| short-032 | NIST | NIST | NIST:1 |
| long-019 | No applicable VCFs found | Keine anwendbaren VCF gefunden | VCFs:0 |
| short-033 | NO DNAT | KEIN DNAT | DNAT:0 |
| short-033 | No Prepend | Kein Prepend | Prepend:0 |
| short-033 | NO SNAT | KEIN SNAT | SNAT:0 |
| short-033 | NodeClass | NodeClass | NodeClass:0 |
| short-033 | Non-Preemptive | Nicht präemptiv | Non-Preemptive:0 |
| long-019 | Non-Preemptive (failover) | Nicht präemptiv (Failover) | Non-Preemptive:0 |
| long-019 | Non-preemptive (T1 failover) | Nicht präemptiv (T1-Failover) | Non-preemptive:0, Non-preemptive T1:0 |
| short-033 | Non-Propagating | Ohne Weitergabe | Non-Propagating:0 |
| short-033 | Non-Stretched | Nicht gestreckt | Non-Stretched:0 |
| long-019 | Non-VM (user objects) usage | Nutzung durch Nicht-VM-Objekte (Benutzerobjekte) | Non-VM:2 |
| long-019 | Non-VM user objects usage | Nutzung durch Nicht-VM-Benutzerobjekte | Non-VM:2 |
| short-033 | North-South | Nord-Süd | North-South:0 |
| short-033 | Not Drifted | Keine Abweichung | Drifted:0 |
| short-033 | Not Realized | Nicht realisiert | Realized:0 |
| short-033 | Nov | Nov | Nov:0 |
| short-033 | Novell Netware 4 | Novell Netware 4 | Novell:0, Novell Netware:0, Netware:0 |
| short-033 | Novell Netware 5 | Novell Netware 5 | Novell:0, Novell Netware:0, Netware:0 |
| short-033 | Novell Netware 6 | Novell Netware 6 | Novell:0, Novell Netware:0, Netware:0 |
| short-033 | November | November | November:0 |
| short-033 | NSSA | NSSA | NSSA:0 |
| short-034 | NSX-V | NSX-V | NSX-V:0 |
| long-019 | NtlmAuthentication (app) | NtlmAuthentication (App) | NtlmAuthentication:0 |
| short-034 | OAuth 2.0 | OAuth 2.0 | OAuth:2 |
| short-034 | Observation | Beobachtung | Observation:1 |
| short-034 | Observations | Beobachtungen | Observations:0 |
| short-034 | ODS | ODS | ODS:0 |
| long-020 | ODS (on demand system) | ODS (On-Demand-System) | ODS:0 |
| short-034 | OIDC | OIDC | OIDC:0 |
| short-034 | OIDC (VKS) | OIDC (VKS) | OIDC:0, OIDC VKS:0, VKS:0 |
| short-034 | Okay | OK | Okay:0 |
| short-034 | Okta | Okta | Okta:0 |
| short-034 | On-premises (ABX) | Lokal (ABX) | On-premises:0, On-premises ABX:0, ABX:0 |
| long-020 | On-Premises (router location) | On-Premises (Routerstandort) | On-Premises:0 |
| short-035 | OpenLDAP | OpenLDAP | OpenLDAP:0 |
| short-035 | OpenSSL | OpenSSL | OpenSSL:2 |
| short-035 | Optimize | Optimieren | Optimize:2 |
| long-020 | Optimize (deployment) | Optimieren (Bereitstellung) | Optimize:2 |
| short-035 | Orange | Orange | Orange:0 |
| short-035 | Orchestrate | Orchestrieren | Orchestrate:1 |
| short-035 | Orchestrator | Orchestrator | Orchestrator:1 |
| short-035 | Organisation (O) | Organisation (O) | Organisation:0, Organisation O:0 |
| short-035 | Organization | Organisation | Organization:2 |
| long-020 | Organization description | Organisationsbeschreibung | Organization:2 |
| long-020 | Organization for All Apps | Organisation für alle Apps | Organization:2, Apps:0 |
| short-035 | Organization name | Organisationsname | Organization:2 |
| short-035 | Organizations | Organisationen | Organizations:0 |
| long-020 | Organizations (automation) | Organisationen (Automation) | Organizations:0 |
| short-035 | OSAM | OSAM | OSAM:0 |
| short-035 | OSImage | OSImage | OSImage:0 |
| short-035 | OSPF | OSPF | OSPF:0 |
| short-035 | OSPF Neighbors | OSPF-Nachbarn | OSPF:0, OSPF Neighbors:0, Neighbors:0 |
| short-035 | OSPF toggle | OSPF-Schalter | OSPF:0 |
| short-035 | OSPFv2 | OSPFv2 | OSPFv2:0 |
| long-020 | Over-commitment ratio: | Überbelegungsverhältnis: | Over-commitment:1 |
| long-020 | Overlay-backed segments | Overlay-basierte Segmente | Overlay-backed:0 |
| short-035 | Oversized | Überdimensioniert | Oversized:0 |
| short-035 | P2P | P2P | P2P:0 |
| short-035 | P2P (OSPF) | P2P (OSPF) | P2P:0, P2P OSPF:0, OSPF:0 |
| short-035 | PackageInstall | PackageInstall | PackageInstall:0 |
| long-020 | Parents (alert scope) | Übergeordnete Objekte (Warnungsbereich) | Parents:1 |
| short-035 | PartnerSupported | PartnerSupported | PartnerSupported:1 |
| short-036 | Passphrase | Kennwortsatz | Passphrase:2 |
| short-036 | Passphrase (cert) | Kennwortsatz (Zertifikat) | Passphrase:2 |
| short-036 | Paste | Einfügen | Paste:1 |
| short-036 | PFTT | PFTT | PFTT:0 |
| short-036 | PHM | PHM | PHM:1 |
| short-036 | Photon (OS) | Photon (Betriebssystem) | Photon:2, Photon OS:1 |
| short-036 | PIM | PIM | PIM:0 |
| short-036 | PIM-SM | PIM-SM | PIM-SM:0 |
| short-036 | Pinniped | Pinniped | Pinniped:0 |
| short-036 | Pins and Dashboards | Pins und Dashboards | Dashboards:2, Pins:0 |
| short-036 | PKI (Orchestrator) | PKI (Orchestrator) | Orchestrator:1, PKI:0, PKI Orchestrator:0 |
| long-021 | Placeholder datastore | Platzhalter-Datenspeicher | Placeholder:2 |
| short-036 | Placeholder VM | Platzhalter-VM | Placeholder:2, Placeholder VM:0 |
| long-021 | Planning and Preparation | Planung und Vorbereitung | Planning:2, Preparation:0 |
| long-021 | Pod-to-external traffic | Datenverkehr von Pods nach extern | Pod-to-external:0 |
| short-037 | Pod-to-pod traffic | Datenverkehr zwischen Pods | Pod-to-pod:0 |
| long-021 | podvm-router routes traffic coming from PodVM when using vds-vsip load | podvm-router leitet den von PodVM kommenden Datenverkehr weiter, wenn  | PodVM:0 |
| short-037 | Policy-As-Code | Policy-as-Code | Policy-As-Code:0 |
| long-021 | Port-level configuration reset | Zurücksetzen der Konfiguration auf Portebene | Port-level:0 |
| short-037 | Posixid | Posixid | Posixid:0 |
| short-037 | Post-copy | Kopiernachbereitung | Post-copy:0 |
| short-037 | Postcustomization | Nach der Anpassung | Postcustomization:0 |
| long-021 | PowerShell (Orchestrator) | PowerShell (Orchestrator) | Orchestrator:1, PowerShell:0, PowerShell Orchestrator:0 |
| short-037 | PowerShell (runtime) | PowerShell (Laufzeit) | PowerShell:0 |
| short-037 | Pre-defined | Vordefiniert | Pre-defined:2 |
| short-037 | Pre-Rules | Pre-Regeln | Pre-Rules:0 |
| short-037 | Precheks | Vorabprüfungen | Precheks:0 |
| short-037 | Precustomization | Vor der Anpassung | Precustomization:0 |
| short-037 | Preemptive | Präemptiv | Preemptive:0 |
| long-021 | Preemptive (failover) | Präemptiv (Failover) | Preemptive:0 |
| long-021 | Preemptive (T1 failover) | Präemptiv (T1-Failover) | Preemptive:0, Preemptive T1:0 |
| short-037 | Prefault | Prefault | Prefault:1 |
| short-038 | Price | Preis | Price:0 |
| short-038 | Price (deployment) | Preis (Bereitstellung) | Price:0 |
| short-038 | Privacy | Datenschutz | Privacy:1 |
| short-038 | Progressive Pair-Sum | Progressive Paarsumme | Progressive:0, Progressive Pair-Sum:0, Pair-Sum:0 |
| long-022 | Project-specific view | Projektspezifische Ansicht | Project-specific:0 |
| short-038 | Projects | Projekte | Projects:1 |
| long-022 | Projects (automation) | Projekte (Automation) | Projects:1 |
| short-038 | PRP | PRP | PRP:1 |
| short-038 | PSI | PSI | PSI:0 |
| short-038 | PSK | PSK | PSK:0 |
| short-039 | PVC | PVC | PVC:1 |
| short-039 | PVRDMAAsyncIOWorlds | PVRDMAAsyncIOWorlds | PVRDMAAsyncIOWorlds:0 |
| short-039 | PVSCSI | PVSCSI | PVSCSI:2 |
| short-039 | Q-Series vGPU | vGPU der Q-Serie | Q-Series:0 |
| short-039 | QuarantineMode | QuarantineMode | QuarantineMode:0 |
| short-039 | Queuepair | Queuepair | Queuepair:1 |
| short-039 | RAV | RAV | RAV:0 |
| short-039 | RBAC | RBAC | RBAC:0 |
| short-039 | RDU | RDU | RDU:0 |
| long-022 | RDU (vCenter upgrade) | RDU (vCenter-Upgrade) | RDU:0 |
| long-022 | Realization (Federation) | Realisierung (Föderation) | Realization:2, Federation:1, Realization Federation:0 |
| short-039 | Realized | Realisiert | Realized:0 |
| short-039 | Recents (dashboard) | Zuletzt verwendet (Dashboard) | Recents:0 |
| short-039 | Recents (dashboards) | Zuletzt verwendet (Dashboards) | Recents:0 |
| short-039 | Recipient(s) | Empfänger | Recipient:0 |
| short-039 | Reclaimable | Zurückgewinnbar | Reclaimable:2 |
| short-039 | Redeploy | Erneut bereitstellen | Redeploy:1 |
| short-039 | Redistribute Tier-1 | Tier-1-Routen umverteilen | Redistribute:0, Redistribute Tier-1:0, Tier-1:0 |
| short-039 | Reflexive | Reflexiv | Reflexive:0 |
| short-040 | Regulatory | Regulatorisch | Regulatory:0 |
| long-022 | Regulatory benchmarks | Regulatorische Benchmarks | Regulatory:0 |
| short-040 | Reject (approval) | Ablehnen (Genehmigung) | Reject:1 |
| short-040 | Reject (firewall) | Ablehnen (Firewall) | Reject:1 |
| short-040 | Reject (GFW action) | Ablehnen (GFW-Aktion) | Reject:1, Reject GFW:0, GFW:0 |
| short-040 | Reject (policy) | Ablehnen (Richtlinie) | Reject:1 |
| long-023 | Reorder dashboard tabs | Dashboard-Registerkarten neu anordnen | Reorder:2 |
| short-040 | Repeatedly (action) | Wiederholt (Aktion) | Repeatedly:0 |
| short-040 | Repeater | Repeater | Repeater:0 |
| short-040 | Replications | Replizierungen | Replications:0 |
| short-040 | Replications tab | Registerkarte „Replizierungen“ | Replications:0 |
| short-040 | Repoint vCenter | vCenter neu ausrichten | Repoint:0 |
| short-041 | Reprotect | Erneut schützen | Reprotect:0 |
| short-041 | Reprovisioning | Neubereitstellung | Reprovisioning:0 |
| short-041 | Requester | Anforderer | Requester:0 |
| short-041 | Requestor | Anforderer | Requestor:0 |
| short-041 | Resolver | Resolver | Resolver:1 |
| short-041 | ResourcePolicy | ResourcePolicy | ResourcePolicy:0 |
| long-023 | Retrace the Traceflow | Traceflow erneut ausführen | Retrace:0, Traceflow:0 |
| short-041 | REWRITE (cookie) | REWRITE (Cookie) | REWRITE:0 |
| short-041 | Right-click menu | Kontextmenü | Right-click:1 |
| short-041 | Right-size | Größe anpassen | Right-size:0 |
| short-041 | Right-Size | Größe anpassen | Right-Size:0 |
| short-041 | Rightsize | Größe anpassen | Rightsize:0 |
| short-041 | Rightsizing | Größenanpassung | Rightsizing:0 |
| short-042 | Role-Based Approval | Rollenbasierte Genehmigung | Role-Based:0, Role-Based Approval:0, Approval:0 |
| short-042 | Rollups | Rollups | Rollups:0 |
| short-042 | Route-based VPN | Routenbasiertes VPN | Route-based:0, Route-based VPN:0, VPN:0 |
| short-042 | Routed (network) | Geroutet (Netzwerk) | Routed:0 |
| short-042 | RSA-2048 | RSA-2048 | RSA-2048:0 |
| short-042 | RTEP | RTEP | RTEP:0 |
| short-042 | Runbook | Runbook | Runbook:0 |
| short-042 | Runbooks | Runbooks | Runbooks:0 |
| short-042 | RuntimeClass (TKG) | RuntimeClass (TKG) | RuntimeClass:0, RuntimeClass TKG:0, TKG:0 |
| short-042 | Salt | Salt | Salt:0 |
| short-042 | SameSize (vGPU) | SameSize (vGPU) | SameSize:0 |
| short-043 | Scales | Skalen | Scales:0 |
| short-043 | Scenario | Szenario | Scenario:2 |
| short-043 | SCIM | SCIM | SCIM:0 |
| short-043 | SCO OpenServer 5 | SCO OpenServer 5 | SCO:0, SCO OpenServer:0, OpenServer:0 |
| short-043 | SCO OpenServer 6 | SCO OpenServer 6 | SCO:0, SCO OpenServer:0, OpenServer:0 |
| long-024 | Scoreboard (for selected VM) | Scoreboard (für ausgewählte VM) | Scoreboard:1 |
| short-043 | Scoreboard Widget | Anzeigetafel-Widget | Scoreboard:1, Scoreboard Widget:0, Widget:0 |
| short-043 | SEL entries | SEL-Einträge | SEL:0 |
| short-044 | Self-Signed | Selbstsigniert | Self-Signed:2 |
| short-044 | Sentinel (SEN) | Sentinel (SEN) | Sentinel:0, Sentinel SEN:0, SEN:0 |
| short-044 | Sep | Sep | Sep:1 |
| short-044 | September | September | September:0 |
| short-044 | Seq# | Seq.-Nr. | Seq:0 |
| short-044 | Set Subnets | Subnetze festlegen | Subnets:2 |
| short-045 | SEV-ES | SEV-ES | SEV-ES:0 |
| short-045 | SEV-SNP (VM) | SEV-SNP (VM) | SEV-SNP:0, SEV-SNP VM:0 |
| short-045 | Sever | Trennen | Sever:1 |
| short-045 | SHA2 256 | SHA2 256 | SHA2:0 |
| short-045 | SHA2 384 | SHA2 384 | SHA2:0 |
| short-045 | SHA2 512 | SHA2 512 | SHA2:0 |
| short-045 | Shallow Recrypt | Flache erneute Verschlüsselung | Shallow:2, Recrypt:1, Shallow Recrypt:0 |
| short-045 | Shallow recryption | Flache erneute Verschlüsselung | Shallow:2 |
| short-045 | ShallowRekey | ShallowRekey | ShallowRekey:0 |
| short-045 | Showback | Showback | Showback:0 |
| short-045 | Siemens | Siemens | Siemens:0 |
| short-045 | SILENCED (precheck) | STUMMGESCHALTET (Vorabprüfung) | SILENCED:1 |
| short-045 | Singleton | Singleton | Singleton:0 |
| short-045 | Sink port | Sink-Port | Sink:0 |
| long-025 | Site-level Resilience | Ausfallsicherheit auf Site-Ebene | Resilience:2, Site-level:0, Site-level Resilience:0 |
| short-045 | Slack | Slack | Slack:1 |
| short-045 | Slave | Slave | Slave:2 |
| short-046 | SNAT | SNAT | SNAT:0 |
| short-046 | SNAT (VPC) | SNAT (VPC) | VPC:1, SNAT:0, SNAT VPC:0 |
| short-046 | Solicit | Solicit | Solicit:0 |
| short-046 | SoS | SoS | SoS:0 |
| short-046 | Sparkline | Sparkline | Sparkline:0 |
| short-046 | Splitter collapsed | Trennleiste reduziert | Splitter:0 |
| short-046 | Splitter restored | Trennleiste wiederhergestellt | Splitter:0 |
| short-046 | SpoofGuard | SpoofGuard | SpoofGuard:0 |
| short-046 | Spread (placement) | Verteilen (Platzierung) | Spread:1 |
| short-046 | SRA | SRA | SRA:0 |
| short-047 | State-based alarm | Zustandsbasierter Alarm | State-based:0 |
| short-047 | STIG | STIG | STIG:0 |
| short-047 | StorageClass | StorageClass | StorageClass:0 |
| short-048 | Stub | Stub | Stub:0 |
| short-048 | Subjects | Subjekte | Subjects:1 |
| long-027 | Subnet-VLAN Enrichment | Subnetz-VLAN-Anreicherung | Subnet-VLAN:0, Subnet-VLAN Enrichment:0, Enrichment:0 |
| short-048 | Subnets | Subnetze | Subnets:2 |
| long-027 | Subnets cannot overlap | Subnetze dürfen sich nicht überschneiden | Subnets:2 |
| long-027 | Subscribers (library) | Abonnenten (Bibliothek) | Subscribers:2 |
| short-048 | Subtype | Untertyp | Subtype:1 |
| short-048 | Summation (rollup) | Summierung (Rollup) | Summation:2 |
| short-048 | Supervisors | Supervisors | Supervisors:0 |
| long-027 | SupervisorService CRD | SupervisorService CRD | SupervisorService:0, SupervisorService CRD:0, CRD:0 |
| short-048 | Suppress | Unterdrücken | Suppress:1 |
| short-048 | Synthetic Timers | Synthetische Timer | Synthetic:0, Synthetic Timers:0, Timers:0 |
| short-048 | System-wide users | Systemweite Benutzer | System-wide:1 |
| short-048 | SystemBoard | Systemplatine | SystemBoard:1 |
| short-049 | T0 Active-Active | T0 Aktiv-Aktiv | Active-Active:0 |
| short-049 | T0 Active-Standby | T0 Aktiv-Standby | Active-Standby:0 |
| short-049 | Tag-based exclusion | Tag-basierter Ausschluss | Tag-based:0 |
| short-049 | TcpipHWLRONoDelayAck | TcpipHWLRONoDelayAck | TcpipHWLRONoDelayAck:0 |
| short-049 | Telegraf | Telegraf | Telegraf:0 |
| short-049 | TEP | TEP | TEP:0 |
| short-049 | TEP IP | TEP-IP | TEP:0, TEP IP:0 |
| short-049 | Terabyte | Terabyte | Terabyte:0 |
| long-028 | Term-based subscription | Laufzeitbasiertes Abonnement | Term-based:0 |
| long-028 | Terraform configurations | Terraform-Konfigurationen | Terraform:0 |
| short-049 | TFC | TFC | TFC:0 |
| short-049 | TGW | TGW | TGW:0 |
| long-028 | The tier-1 gateway must be in the Active-Standby mode. | Das Tier-1-Gateway muss sich im Aktiv-Standby-Modus befinden. | Active-Standby:0 |
| long-028 | This package contains dvfilter-generic-fastpath(TrafficFilter) module. | Dieses Paket enthält das Modul „dvfilter-generic-fastpath“ (TrafficFil | TrafficFilter:0 |
| short-050 | Threat Intelligence | Bedrohungsdaten | Threat:0, Threat Intelligence:0, Intelligence:0 |
| short-050 | TiB (license) | TiB (Lizenz) | TiB:0 |
| short-050 | TiB entitlement | TiB-Berechtigung | TiB:0 |
| short-050 | Tier-0 (segment) | Tier-0 (Segment) | Tier-0:0 |
| short-050 | Tier-0 VRF | Tier-0-VRF | Tier-0:0, Tier-0 VRF:0, VRF:0 |
| short-050 | Tier-1 (segment) | Tier-1 (Segment) | Tier-1:0 |
| short-050 | Tier-1 Downlinks | Tier-1-Downlinks | Tier-1:0, Tier-1 Downlinks:0, Downlinks:0 |
| long-028 | Tier-1 gateway (LB attachment) | Tier-1-Gateway (LB-Anbindung) | Tier-1:0 |
| short-050 | Time-based rule | Zeitbasierte Regel | Time-based:0 |
| short-050 | Timespan | Zeitspanne | Timespan:1 |
| short-050 | Timespan: | Zeitspanne: | Timespan:1 |
| short-050 | TKC | TKC | TKC:0 |
| short-050 | TKG | TKG | TKG:0 |
| short-050 | TKR | TKR | TKR:0 |
| short-050 | TMC | TMC | TMC:0 |
| short-050 | TNP | TNP | TNP:0 |
| short-050 | Traceflow | Traceflow | Traceflow:0 |
| long-028 | Traceflow (Federation) | Traceflow (Federation) | Federation:1, Traceflow:0, Traceflow Federation:0 |
| short-050 | Transformation | Transformation | Transformation:0 |
| short-050 | Translated IP | Übersetzte IP | Translated:2, Translated IP:0 |
| short-050 | Transparent (SNAT) | Transparent (SNAT) | Transparent:0, Transparent SNAT:0, SNAT:0 |
| short-050 | Transparent bridge | Transparente Bridge | Transparent:0 |
| short-050 | Trending | Trend | Trending:2 |
| short-051 | TTL | TTL | TTL:1 |
| short-051 | Tunnel mode | Tunnelmodus | Tunnel:2 |
| short-051 | ULM | ULM | ULM:0 |
| short-051 | Unaccessed | Nicht aufgerufen | Unaccessed:0 |
| short-051 | Uncommitted | Nicht festgeschrieben | Uncommitted:2 |
| short-051 | Undersized | Unterdimensioniert | Undersized:1 |
| short-051 | UnmapOptimization | UnmapOptimization | UnmapOptimization:0 |
| short-051 | Unprivileged | Nicht privilegiert | Unprivileged:0 |
| short-051 | Unpublish | Veröffentlichung aufheben | Unpublish:0 |
| short-051 | Unselected | Nicht ausgewählt | Unselected:0 |
| short-051 | Unsuppress | Unterdrückung aufheben | Unsuppress:0 |
| short-052 | Uplink1 | Uplink1 | Uplink1:0 |
| short-052 | Uplink2 | Uplink2 | Uplink2:0 |
| short-052 | UPN | UPN | UPN:0 |
| short-052 | Urgency | Dringlichkeit | Urgency:0 |
| short-052 | US Dvorak | US-Dvorak | Dvorak:2 |
| short-052 | Use StartTLS | StartTLS verwenden | StartTLS:0 |
| short-052 | User-Based Approval | Benutzerbasierte Genehmigung | User-Based:0, User-Based Approval:0, Approval:0 |
| short-052 | vApp Author | vApp-Autor | Author:2 |
| short-053 | VAs | VAs | VAs:2 |
| short-053 | VBS | VBS | VBS:0 |
| short-053 | vCenter Linking | vCenter-Verknüpfung | Linking:0 |
| short-053 | VCF | VCF | VCF:0 |
| short-053 | VCF benchmarks | VCF-Benchmarks | VCF:0 |
| short-053 | VCF Bring-Up | VCF-Bring-Up | VCF:0, VCF Bring-Up:0, Bring-Up:0 |
| short-053 | VCF Converge | VCF-Konvergenz | Converge:1, VCF:0, VCF Converge:0 |
| short-053 | VCF Fleet | VCF Fleet | VCF:0, VCF Fleet:0, Fleet:0 |
| short-053 | VCF OFN | VCF OFN | VCF:0, VCF OFN:0, OFN:0 |
| short-053 | VCF Orchestrator | VCF Orchestrator | Orchestrator:1, VCF:0, VCF Orchestrator:0 |
| short-053 | VCF services runtime | Laufzeit der VCF-Dienste | VCF:0 |
| short-053 | VCF version | VCF-Version | VCF:0 |
| short-053 | vDefend ATP | vDefend ATP | ATP:0 |
| long-030 | Versioning (Orchestrator) | Versionierung (Orchestrator) | Orchestrator:1, Versioning:0, Versioning Orchestrator:0 |
| short-053 | VGFA | VGFA | VGFA:0 |
| short-053 | Victim IP | Opfer-IP | Victim:0, Victim IP:0 |
| short-053 | VIDB (cert) | VIDB (Zertifikat) | VIDB:0 |
| short-054 | VIDM | VIDM | VIDM:0 |
| long-031 | Viewer (namespace role) | Betrachter (Namespace-Rolle) | Viewer:0 |
| short-054 | VIF | VIF | VIF:0 |
| short-054 | VIFs | VIFs | VIFs:0 |
| short-054 | VIP | VIP | VIP:1 |
| long-031 | VirtualMachineClass (binding) | VirtualMachineClass (Bindung) | VirtualMachineClass:0 |
| short-054 | Visualization Canvas | Visualisierungsbereich | Visualization:0, Visualization Canvas:0, Canvas:0 |
| short-054 | Visualize | Visualisieren | Visualize:0 |
| short-054 | VKr 1.32 | VKr 1.32 | VKr:0 |
| short-054 | VKS | VKS | VKS:0 |
| short-054 | VLAN-backed | VLAN-gestützt | VLAN-backed:0 |
| short-054 | VLAN-backed segments | VLAN-gestützte Segmente | VLAN-backed:0 |
| long-031 | VM Apps Organizations | VM Apps-Organisationen | Apps:0, Apps Organizations:0, Organizations:0 |
| short-055 | VM vNIC (Traceflow) | VM-vNIC (Traceflow) | Traceflow:0 |
| long-031 | VMCA-signed certificate | Von VMCA signiertes Zertifikat | VMCA-signed:0 |
| short-055 | VMCP | VMCP | VMCP:1 |
| short-055 | VMFS6 | VMFS6 | VMFS6:1 |
| long-032 | VMotionMaxStreamHelpers | VMotionMaxStreamHelpers | VMotionMaxStreamHelpers:0 |
| short-055 | VMSD | VMSD | VMSD:1 |
| short-055 | VMSN | VMSN | VMSN:2 |
| short-055 | VMware-certified | VMware-zertifiziert | VMware-certified:0 |
| short-055 | VMwareAccepted | VMwareAccepted | VMwareAccepted:1 |
| short-055 | VMwareCertified | VMwareCertified | VMwareCertified:1 |
| short-055 | VMX-22 | VMX-22 | VMX-22:0 |
| short-055 | VNAC | VNAC | VNAC:0 |
| short-055 | VNI | VNI | VNI:0 |
| short-055 | VPC | VPC | VPC:1 |
| short-055 | VPC (namespace) | VPC (Namespace) | VPC:1 |
| short-055 | VPC in vCenter | VPC in vCenter | VPC:1 |
| short-055 | VPC subnets | VPC-Subnetze | VPC:1 |
| short-055 | VPC Subnets (HCX) | VPC-Subnetze (HCX) | Subnets:2, VPC:1, VPC Subnets:1 |
| short-055 | VPC-Ready | VPC-bereit | VPC-Ready:0 |
| short-055 | VPCs (quota) | VPCs (Kontingent) | VPCs:0 |
| short-055 | VPN | VPN | VPN:0 |
| short-055 | VPN (stateful) | VPN (statusbehaftet) | VPN:0 |
| short-056 | VPN Tunnel | VPN-Tunnel | Tunnel:2, VPN:0, VPN Tunnel:0 |
| short-056 | VPN Tunnel ID | VPN-Tunnel-ID | Tunnel:2, VPN:0, VPN Tunnel:0 |
| long-032 | VPN Tunnel ID (segment) | VPN-Tunnel-ID (Segment) | Tunnel:2, VPN:0, VPN Tunnel:0 |
| short-056 | VRAM | VRAM | VRAM:2 |
| long-032 | vRealize Orchestrator | vRealize Orchestrator | Orchestrator:1 |
| short-056 | vRealize Suite | vRealize Suite | Suite:1 |
| short-056 | VRF | VRF | VRF:0 |
| short-056 | VRF Lite | VRF Lite | VRF:0, VRF Lite:0, Lite:0 |
| short-056 | vSAN Heatmap | vSAN-Heatmap | Heatmap:0 |
| short-056 | vSAN TiB | vSAN TiB | TiB:0 |
| short-056 | VSF | VSF | VSF:0 |
| short-056 | vSphere Dashboards | vSphere-Dashboards | Dashboards:2 |
| short-056 | VTEP | VTEP | VTEP:0 |
| short-056 | VTI | VTI | VTI:0 |
| short-056 | VXLAN | VXLAN | VXLAN:0 |
| short-056 | VXLAN Tunnel | VXLAN-Tunnel | Tunnel:2, VXLAN:0, VXLAN Tunnel:0 |
| short-057 | Watt | Watt | Watt:2 |
| long-033 | Well-known configuration users' group which contains all configuration | Bekannte Gruppe der Konfigurationsbenutzer, die alle Konfigurationsben | Well-known:1 |
| long-033 | Well-known external IDP users' group, which registers external IDP use | Bekannte Gruppe der externen IDP-Benutzer, über die externe IDP-Benutz | IDP:2, Well-known:1 |
| long-033 | Well-known solution users' group, which contains all solution users as | Bekannte Gruppe der Lösungsbenutzer, die alle Lösungsbenutzer als Mitg | Well-known:1 |
| short-057 | Widget | Widget | Widget:0 |
| short-057 | Widget interactions | Widget-Interaktionen | Widget:0 |
| short-057 | Widget Interactions | Widget-Interaktionen | Widget:0, Widget Interactions:0, Interactions:0 |
| short-057 | Widgets | Widgets | Widgets:0 |
| short-057 | Workbench | Workbench | Workbench:0 |
| short-057 | Workflows | Workflows | Workflows:0 |
| long-033 | Workflows (Orchestrator) | Workflows (Orchestrator) | Orchestrator:1, Workflows:0, Workflows Orchestrator:0 |
| short-057 | Workgroup | Arbeitsgruppe | Workgroup:0 |
| long-033 | Workgroup (customization) | Arbeitsgruppe (Anpassung) | Workgroup:0 |
| short-057 | Workgroup or domain | Arbeitsgruppe oder Domäne | Workgroup:0 |
| short-057 | WSFC | WSFC | WSFC:0 |
| short-057 | WWNN | WWNN | WWNN:1 |
| short-057 | WWPN | WWPN | WWPN:1 |
| short-057 | X-Forwarded-For | X-Forwarded-For | X-Forwarded-For:0 |
| short-057 | YAML editor | YAML-Editor | YAML:0 |
| long-034 | YAML-Based Governance | YAML-basierte Governance | YAML-Based:0, YAML-Based Governance:0, Governance:0 |
| short-057 | Zonal | Zonal | Zonal:1 |
| short-057 | Zonal. | Zonal. | Zonal:1 |
| short-057 | ZTP | ZTP | ZTP:0 |

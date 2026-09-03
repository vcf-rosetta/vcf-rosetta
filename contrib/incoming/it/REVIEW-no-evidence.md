# it 机翻:缺库内依据的条目(人工复核队列)

由 `node contrib/flag-unsupported.mjs it --max-hits 2` 生成,可复现。

判定:该条目英文键里的**所有**实词在 `glossary.it.json` 的英文键中命中数都 <= 2,
即完全没有库内先例可依,译文只能靠推断。

**这不是「翻错了」的清单,是「无据可依」的清单。** VCF 9 的新概念必然落在这里 ——
官方 8.0 语言包里没有这些词,只能等有母语运维实际看到界面才能定。

共 778 条。

| 批次 | 英文 | 当前译文 | 实词命中数 |
|---|---|---|---|
| short-001 | (Auto-assign) | (Assegnazione automatica) | Auto-assign:0 |
| short-001 | 3D Renderer | Renderer 3D | Renderer:1 |
| long-001 | A HMACOutputLength can only be specified for HMAC integrity algorithms | È possibile specificare un valore HMACOutputLength solo per gli algori | HMACOutputLength:0, HMAC:0 |
| short-001 | AA Compromise | Compromissione AA | Compromise:2 |
| short-001 | ABX | ABX | ABX:0 |
| long-001 | Active-Active (Tier-0) | Attivo-Attivo (Tier-0) | Active-Active:0, Active-Active Tier-0:0, Tier-0:0 |
| short-001 | Active-Standby (LB) | Attivo-standby (LB) | Active-Standby:0, Active-Standby LB:0 |
| long-001 | Active-Standby (Tier-0) | Attivo-Standby (Tier-0) | Active-Standby:0, Active-Standby Tier-0:0, Tier-0:0 |
| short-002 | Add a GRE Tunnel | Aggiungi un tunnel GRE | Tunnel:2, GRE:1, GRE Tunnel:0 |
| short-002 | Add BGP Neighbor | Aggiungi neighbor BGP | BGP:0, BGP Neighbor:0, Neighbor:0 |
| short-002 | Add Criterion | Aggiungi criterio | Criterion:0 |
| long-001 | Add Edge (to cluster) | Aggiungi Edge (al cluster) | Edge:2 |
| short-002 | Add Edge VM | Aggiungi macchina virtuale Edge | Edge:2, Edge VM:1 |
| short-002 | Add IP Ranges | Aggiungi intervalli IP | Ranges:2 |
| short-002 | Add OSPF | Aggiungi OSPF | OSPF:0 |
| short-003 | Add Scenario | Aggiungi scenario | Scenario:2 |
| short-003 | Add to Favorites | Aggiungi a Preferiti | Favorites:0 |
| short-003 | Add VPC | Aggiungi VPC | VPC:1 |
| short-003 | Add Widget | Aggiungi widget | Widget:0 |
| short-003 | Add-on license | Licenza aggiuntiva | Add-on:0 |
| short-003 | Administrators | Amministratori | Administrators:1 |
| long-002 | Administrators who manage the trusted hosts | Amministratori che gestiscono gli host attendibili | Administrators:1 |
| short-003 | Advertise | Annuncia | Advertise:0 |
| short-003 | Aggressive | Aggressivo | Aggressive:1 |
| long-002 | All Apps Organizations | Tutte le organizzazioni delle app | Apps:0, Apps Organizations:0, Organizations:0 |
| short-004 | All Dashboards | Tutti i dashboard | Dashboards:2 |
| short-004 | All Deployments | Tutte le distribuzioni | Deployments:2 |
| short-004 | All Projects | Tutti i progetti | Projects:1 |
| short-004 | ALUA | ALUA | ALUA:1 |
| short-004 | Anomalies | Anomalie | Anomalies:0 |
| short-004 | Ansible Tower | Ansible Tower | Ansible:0, Ansible Tower:0, Tower:0 |
| short-004 | Antrea | Antrea | Antrea:0 |
| short-005 | Applied-To | Applicato a | Applied-To:0 |
| short-005 | Approval policy | Criterio di approvazione | Approval:0 |
| short-005 | Approval type | Tipo di approvazione | Approval:0 |
| short-005 | Approvals page | Pagina Approvazioni | Approvals:0 |
| short-005 | Approve | Approva | Approve:0 |
| long-002 | Approved (recommendation) | Approvato (consiglio) | Approved:1 |
| short-005 | Approver | Approvatore | Approver:0 |
| short-005 | Approver mode | Modalità approvatore | Approver:0 |
| short-005 | Approver role | Ruolo approvatore | Approver:0 |
| short-005 | Approvers | Approvatori | Approvers:0 |
| short-005 | Apr | Apr | Apr:1 |
| short-005 | APR | APR | APR:1 |
| short-005 | Aria Suite | Aria Suite | Suite:1, Aria:0, Aria Suite:0 |
| short-005 | Arrange Horizontally | Disponi orizzontalmente | Arrange:0, Arrange Horizontally:0, Horizontally:0 |
| short-005 | Arrange Vertically | Disponi verticalmente | Arrange:0, Arrange Vertically:0, Vertically:0 |
| long-002 | Array-based replication | Replica basata su array | Array-based:0 |
| long-002 | Array-based replication protection group | Gruppo di protezione della replica basata su array | Array-based:0 |
| short-005 | ASN | ASN | ASN:0 |
| short-005 | AssociateMachine | AssociateMachine | AssociateMachine:0 |
| short-005 | ATP | ATP | ATP:0 |
| short-005 | Attacker IP | IP attaccante | Attacker:0, Attacker IP:0 |
| short-005 | Attested by | Attestato da | Attested:1 |
| short-005 | Atto | Atto | Atto:0 |
| short-006 | Authoring | Creazione | Authoring:0 |
| short-006 | Auto-detect settings | Impostazioni di rilevamento automatico | Auto-detect:0 |
| short-006 | Auto-expand | Espansione automatica | Auto-expand:0 |
| long-003 | Auto-generate my passwords | Genera automaticamente le mie password | Auto-generate:0 |
| long-003 | Auto-generate my passwords for newly installed appliances | Genera automaticamente le mie password per le appliance appena install | Auto-generate:0 |
| long-003 | Auto-generate passwords for appliances | Genera automaticamente le password per le appliance | Auto-generate:0 |
| long-003 | Auto-include new disks in replication | Includi automaticamente i nuovi dischi nella replica | Auto-include:0 |
| short-006 | Auto-login count | Numero di accessi automatici | Auto-login:0 |
| short-006 | Auto-negotiate | Negoziazione automatica | Auto-negotiate:1 |
| short-006 | Auto-renewal | Rinnovo automatico | Auto-renewal:0 |
| short-006 | Auto-renewal status | Stato rinnovo automatico | Auto-renewal:0 |
| short-006 | Auto-rotation | Rotazione automatica | Auto-rotation:2 |
| short-006 | Auto-Update | Aggiornamento automatico | Auto-Update:1 |
| long-003 | Autogenerated (wrapping key) | Generata automaticamente (chiave di wrapping) | Autogenerated:1 |
| short-006 | Automap (SNAT) | Mappatura automatica (SNAT) | Automap:0, Automap SNAT:0, SNAT:0 |
| short-006 | AUTOMATE | AUTOMATIZZA | AUTOMATE:0 |
| short-006 | Back-up | Backup | Back-up:0 |
| short-006 | Badge | Badge | Badge:0 |
| short-006 | Badge (widget) | Badge (widget) | Badge:0 |
| short-006 | Bare Metal | Bare metal | Bare:1, Bare Metal:1, Metal:1 |
| short-006 | Bare Metal (edge) | Bare metal (Edge) | Bare:1, Bare Metal:1, Metal:1 |
| short-006 | Bash shell | Shell Bash | Bash:2 |
| short-006 | Bcc Recipients | Destinatari Ccn | Bcc:0, Bcc Recipients:0, Recipients:0 |
| short-006 | BeaconConfig | BeaconConfig | BeaconConfig:2 |
| short-006 | BFD | BFD | BFD:0 |
| short-006 | BFD (BGP) | BFD (BGP) | BFD:0, BFD BGP:0, BGP:0 |
| short-006 | BFD (OSPF) | BFD (OSPF) | BFD:0, BFD OSPF:0, OSPF:0 |
| short-006 | BFD (static route) | BFD (route statica) | BFD:0 |
| short-006 | BFD Multiplier | Moltiplicatore BFD | Multiplier:2, BFD:0, BFD Multiplier:0 |
| short-006 | BGP | BGP | BGP:0 |
| short-006 | BGP (routing) | BGP (routing) | BGP:0 |
| short-007 | BGP EVPN | BGP EVPN | BGP:0, BGP EVPN:0, EVPN:0 |
| short-007 | BGP Multi-hop | BGP multi-hop | BGP:0, BGP Multi-hop:0, Multi-hop:0 |
| short-007 | BGP Neighbor | Neighbor BGP | BGP:0, BGP Neighbor:0, Neighbor:0 |
| short-007 | BGP Neighbors | Neighbor BGP | BGP:0, BGP Neighbors:0, Neighbors:0 |
| long-003 | BGP Neighbors (Tier-0) | Neighbor BGP (Tier-0) | BGP:0, BGP Neighbors:0, Neighbors:0 |
| short-007 | Bill of Materials | Distinta base | Bill:1, Materials:0 |
| short-007 | Bills | Fatture | Bills:0 |
| short-007 | Bindings | Binding | Bindings:1 |
| short-007 | Binpack | Binpack | Binpack:0 |
| long-003 | BlueField RShim driver | Driver RShim BlueField | BlueField:0, BlueField RShim:0, RShim:0 |
| short-007 | Blueprint | Blueprint | Blueprint:0 |
| long-003 | Blueprint (automation) | Blueprint (automazione) | Blueprint:0 |
| short-007 | Blueprints | Blueprint | Blueprints:0 |
| short-007 | BOM | BOM | BOM:0 |
| short-007 | Boolean | Booleano | Boolean:1 |
| short-007 | Bps | Bps | Bps:0 |
| short-007 | Bring-Up | Bring-up | Bring-Up:0 |
| short-007 | Bringup | Bring-up | Bringup:0 |
| short-007 | BRS | BRS | BRS:0 |
| short-007 | Budgeting | Budget | Budgeting:0 |
| short-007 | Bulk actions | Azioni in blocco | Bulk:0 |
| short-007 | C-Series vGPU | vGPU serie C | C-Series:0 |
| short-007 | C-states | Stati C | C-states:1 |
| short-007 | CA Compromise | Compromissione CA | Compromise:2 |
| short-007 | Callout step | Passaggio di callout | Callout:0 |
| short-007 | Campaign | Campagna | Campaign:0 |
| short-007 | Cancellable | Annullabile | Cancellable:1 |
| short-008 | Canvas | Canvas | Canvas:0 |
| short-008 | Cc Recipients | Destinatari Cc | Recipients:0 |
| short-008 | CDP | CDP | CDP:0 |
| long-004 | Cell value has been edited | Il valore della cella è stato modificato | Cell:2 |
| short-008 | Centi | Centi | Centi:0 |
| long-004 | Centralized (network connectivity) | Centralizzata (connettività di rete) | Centralized:1 |
| long-004 | Centralized connection | Connessione centralizzata | Centralized:1 |
| long-004 | Centralized log collection | Raccolta centralizzata dei registri | Centralized:1 |
| short-008 | cert-manager (VKS) | cert-manager (VKS) | VKS:0 |
| short-008 | CertPath is empty | CertPath è vuoto | CertPath:0 |
| short-008 | CFM | CFM | CFM:0 |
| short-008 | Chargeback | Chargeback | Chargeback:0 |
| short-008 | Chassis ID | ID chassis | Chassis:1, Chassis ID:0 |
| long-004 | Check-pointing (Orchestrator) | Creazione di checkpoint (Orchestrator) | Orchestrator:1, Check-pointing:0, Check-pointing Orchestrator:0 |
| short-008 | Checkbox (form) | Casella di controllo (modulo) | Checkbox:2 |
| long-004 | Checklist (commission) | Elenco di controllo (messa in servizio) | Checklist:2 |
| short-008 | CIFS | CIFS | CIFS:1 |
| short-009 | ClusterBootstrap | ClusterBootstrap | ClusterBootstrap:0 |
| short-009 | Collapse All | Comprimi tutto | Collapse:2, Collapse All:1 |
| short-009 | Combined | Combinato | Combined:2 |
| short-009 | Comments (GFW rule) | Commenti (regola GFW) | Comments:0, Comments GFW:0, GFW:0 |
| short-009 | Commission | Metti in servizio | Commission:0 |
| short-009 | Commission button | Pulsante di messa in servizio | Commission:0 |
| short-009 | Commissioning | Messa in servizio | Commissioning:0 |
| short-009 | Committed Projects | Progetti sottoposti a commit | Committed:1, Projects:1, Committed Projects:0 |
| short-009 | Committed Scenarios | Scenari sottoposti a commit | Committed:1, Scenarios:1, Committed Scenarios:0 |
| short-009 | CommunitySupported | CommunitySupported | CommunitySupported:1 |
| long-005 | Condition-based alarm | Allarme basato su condizioni | Condition-based:0 |
| long-005 | Confidential computing | Elaborazione confidenziale | Confidential:0 |
| short-010 | ConfigFile | ConfigFile | ConfigFile:0 |
| long-006 | ConnectionTrack module | Modulo ConnectionTrack | ConnectionTrack:0 |
| short-010 | Consent checkbox | Casella di controllo di consenso | Consent:0 |
| short-010 | Conservative | Conservativo | Conservative:2 |
| long-006 | Continuous optimization | Ottimizzazione continua | Continuous:2 |
| short-011 | Contour (ingress) | Contour (ingress) | Contour:0 |
| long-006 | Converge existing vSphere | Esegui la convergenza di vSphere esistente | Converge:1 |
| short-011 | Converge to VCF | Convergi in VCF | Converge:1, VCF:0 |
| short-011 | Convergence wizard | Procedura guidata di convergenza | Convergence:0 |
| short-011 | CoreDNS | CoreDNS | CoreDNS:0 |
| short-011 | Corrective action | Azione correttiva | Corrective:0 |
| short-011 | Country (CA) | Paese (CA) | Country:2, Country CA:0 |
| short-011 | CpuPolicy | CpuPolicy | CpuPolicy:0 |
| short-012 | Creator | Autore | Creator:0 |
| short-012 | CRI | CRI | CRI:0 |
| short-012 | Criterion | Criterio | Criterion:0 |
| short-012 | Criticality | Criticità | Criticality:0 |
| short-012 | Criticality (alert) | Criticità (avviso) | Criticality:0 |
| long-007 | Cross-vSwitch vMotion | vMotion tra vSwitch | Cross-vSwitch:0 |
| short-012 | Crown Jewels | Asset critici | Crown:0, Crown Jewels:0, Jewels:0 |
| short-012 | CTGW | CTGW | CTGW:0 |
| short-012 | CVSS | CVSS | CVSS:0 |
| short-012 | Dashboards | Dashboard | Dashboards:2 |
| long-007 | Dashboards and Widgets | Dashboard e widget | Dashboards:2, Widgets:0 |
| short-013 | DatastoreCluster | DatastoreCluster | DatastoreCluster:0 |
| short-013 | DbC | DbC | DbC:0 |
| long-008 | DBHealthStatusClearEvent | DBHealthStatusClearEvent | DBHealthStatusClearEvent:0 |
| long-008 | DBHealthStatusErrorEvent | DBHealthStatusErrorEvent | DBHealthStatusErrorEvent:0 |
| long-008 | DBHealthStatusWarningEvent | DBHealthStatusWarningEvent | DBHealthStatusWarningEvent:0 |
| short-013 | Deca | Deca | Deca:0 |
| short-013 | Deci | Deci | Deci:0 |
| short-013 | Decision (workflow) | Decisione (workflow) | Decision:0 |
| short-014 | Deployments | Distribuzioni | Deployments:2 |
| long-009 | Deployments (automation) | Distribuzioni (Automation) | Deployments:2 |
| short-014 | Design | Progettazione | Design:2 |
| short-014 | Design (menu) | Progettazione (menu) | Design:2 |
| short-014 | Design Canvas | Area di progettazione | Design:2, Design Canvas:0, Canvas:0 |
| short-014 | Design canvas | Area di progettazione | Design:2 |
| short-014 | Design page | Pagina di progettazione | Design:2 |
| short-014 | Destinations | Destinazioni | Destinations:0 |
| long-009 | Destinations (firewall rule) | Destinazioni (regola firewall) | Destinations:0 |
| long-009 | Destinations (port mirror) | Destinazioni (mirroring della porta) | Destinations:0 |
| short-014 | DGData | DGData | DGData:0 |
| short-014 | DHCPv4 | DHCPv4 | DHCPv4:0 |
| short-014 | DISA | DISA | DISA:0 |
| short-015 | Dismiss | Ignora | Dismiss:2 |
| short-015 | Dismiss alert | Ignora avviso | Dismiss:2 |
| short-015 | DLB (distributed LB) | DLB (LB distribuito) | DLB:0 |
| long-009 | DN of TrustAnchor is improperly specified | Il DN di TrustAnchor non è specificato correttamente | TrustAnchor:0 |
| short-015 | DNAT | DNAT | DNAT:0 |
| short-015 | DNAT (VPC) | DNAT (VPC) | VPC:1, DNAT:0, DNAT VPC:0 |
| long-009 | Do not change. This is VCF reserved group. | Non modificare. Questo è un gruppo riservato di VCF. | VCF:0 |
| short-015 | Docking station | Docking station | Docking:1 |
| short-015 | DoubleWords | Double word | DoubleWords:0 |
| short-015 | Downlink | Downlink | Downlink:0 |
| short-016 | DPortGroup-EDGE-TEP | DPortGroup-EDGE-TEP | DPortGroup-EDGE-TEP:0 |
| long-010 | DPortGroup-EDGE-UPLINK | DPortGroup-EDGE-UPLINK | DPortGroup-EDGE-UPLINK:0 |
| short-016 | DPortGroup-MGMT | DPortGroup-MGMT | DPortGroup-MGMT:0 |
| short-016 | DPortGroup-VSAN | DPortGroup-VSAN | DPortGroup-VSAN:0 |
| short-016 | DTGW | DTGW | DTGW:0 |
| short-016 | E1000E | E1000E | E1000E:0 |
| short-016 | E1000e | E1000e | E1000e:0 |
| short-016 | East-West | Est-ovest | East-West:0 |
| short-016 | ECDSA | ECDSA | ECDSA:0 |
| short-016 | ECMP | ECMP | ECMP:0 |
| short-016 | ECMP (Tier-0) | ECMP (Tier-0) | ECMP:0, ECMP Tier-0:0, Tier-0:0 |
| long-010 | ECParameters not supported. | ECParameters non supportato. | ECParameters:0 |
| short-016 | Edge Bridges | Bridge Edge | Edge:2, Edge Bridges:0, Bridges:0 |
| short-016 | Edge Bridging | Bridging Edge | Edge:2, Bridging:2, Edge Bridging:0 |
| short-016 | Edge TEP IP | IP TEP Edge | Edge:2, Edge TEP:0, TEP:0 |
| short-017 | EDP | EDP | EDP:0 |
| short-017 | EFI | EFI | EFI:2 |
| short-017 | EFI (firmware) | EFI (firmware) | EFI:2 |
| short-017 | EFI (host) | EFI (host) | EFI:2 |
| long-010 | Elastic (port allocation) | Elastico (allocazione delle porte) | Elastic:2 |
| short-017 | Ellipsis icon | Icona con puntini di sospensione | Ellipsis:0 |
| short-017 | ELM | ELM | ELM:0 |
| short-017 | Emergency (policy) | Emergenza (criterio) | Emergency:2 |
| short-017 | Emergency category | Categoria Emergenza | Emergency:2 |
| long-011 | Enclosure serial number | Numero di serie del contenitore | Enclosure:2 |
| long-011 | EncryptedKey does not contain xenc:CipherData/xenc:CipherValue. | EncryptedKey non contiene xenc:CipherData/xenc:CipherValue. | EncryptedKey:0, CipherData:0, CipherValue:0 |
| short-018 | English | Inglese | English:0 |
| long-012 | ESXio support for single management domain. | Supporto ESXio per un singolo dominio di gestione. | ESXio:1 |
| short-018 | Ethertype | Ethertype | Ethertype:0 |
| short-018 | EUI | EUI | EUI:1 |
| short-018 | Event-based alarm | Allarme basato su eventi | Event-based:0 |
| short-018 | Evidence | Prove | Evidence:0 |
| short-018 | EVPN | EVPN | EVPN:0 |
| short-018 | EVPN (nav) | EVPN (navigazione) | EVPN:0 |
| short-018 | Exa | Exa | Exa:0 |
| short-018 | Excellent | Eccellente | Excellent:0 |
| long-012 | Expose hardware-assisted virtualization | Esponi la virtualizzazione assistita dall'hardware | Expose:2 |
| short-019 | Expressions | Espressioni | Expressions:2 |
| short-019 | Extensibility | Estendibilità | Extensibility:1 |
| long-012 | Extensibility actions | Azioni di estensibilità | Extensibility:1 |
| long-012 | Extensibility subscriptions | Sottoscrizioni di estensibilità | Extensibility:1 |
| long-012 | Extremely Dissatisfied | Estremamente insoddisfatto | Extremely:1, Extremely Dissatisfied:0, Dissatisfied:0 |
| short-019 | Failback | Failback | Failback:1 |
| short-019 | Fallback | Fallback | Fallback:0 |
| short-019 | Favorite | Preferito | Favorite:0 |
| long-012 | Favorites (dashboard) | Preferiti (dashboard) | Favorites:0 |
| long-012 | Favorites (dashboards) | Preferiti (dashboard) | Favorites:0 |
| short-019 | Feb | Feb | Feb:0 |
| short-019 | Federation | Federazione | Federation:1 |
| short-019 | Femto | Femto | Femto:0 |
| short-020 | FIM | FIM | FIM:0 |
| long-012 | Final data synchronization | Sincronizzazione finale dei dati | Final:2 |
| short-020 | FinOps | FinOps | FinOps:0 |
| short-020 | FISMA | FISMA | FISMA:0 |
| short-020 | Fitness | Idoneità | Fitness:1 |
| short-020 | Flavor (criteria) | Flavor (criteri) | Flavor:1 |
| short-020 | Fleet | Fleet | Fleet:0 |
| short-020 | Fleet VM | VM Fleet | Fleet:0, Fleet VM:0 |
| short-020 | Flexible BOM | BOM flessibile | Flexible:1, Flexible BOM:0, BOM:0 |
| short-020 | Flooded | Inondato | Flooded:0 |
| short-020 | Flows | Flussi | Flows:0 |
| short-020 | Footer | Piè di pagina | Footer:0 |
| short-020 | Forecasting | Previsione | Forecasting:0 |
| short-020 | Forecasts | Previsioni | Forecasts:0 |
| short-020 | Forged transmit | Trasmissione contraffatta | Forged:1 |
| short-020 | Forwarded | Inoltrato | Forwarded:0 |
| short-021 | Gauss | Gauss | Gauss:0 |
| short-021 | GeneralUser | GeneralUser | GeneralUser:0 |
| short-021 | Geneve Tunnel | Tunnel Geneve | Tunnel:2, Geneve:0, Geneve Tunnel:0 |
| short-021 | GFW | GFW | GFW:0 |
| short-021 | GHz | GHz | GHz:1 |
| short-021 | GHz (namespace) | GHz (spazio dei nomi) | GHz:1 |
| short-021 | Giga | Giga | Giga:0 |
| long-013 | GitOps-Based Workflows | Flussi di lavoro basati su GitOps | GitOps-Based:0, GitOps-Based Workflows:0, Workflows:0 |
| short-021 | GM-Owned | Di proprietà di GM | GM-Owned:0 |
| short-021 | GMSA | GMSA | GMSA:0 |
| short-021 | GPT | GPT | GPT:1 |
| short-021 | Gracefully disabled | Disattivato correttamente | Gracefully:0 |
| short-021 | GRE | GRE | GRE:1 |
| short-021 | GRE Tunnel | Tunnel GRE | Tunnel:2, GRE:1, GRE Tunnel:0 |
| short-021 | Grouping (alerts) | Raggruppamento (avvisi) | Grouping:2 |
| short-022 | GWFW | GWFW | GWFW:0 |
| short-022 | HCX | HCX | HCX:0 |
| short-022 | HCX Assisted vMotion | vMotion assistito da HCX | HCX:0, HCX Assisted:0, Assisted:0 |
| short-022 | HCX Connector | HCX Connector | HCX:0, HCX Connector:0, Connector:0 |
| short-022 | HCX Interconnect | Interconnessione HCX | Interconnect:1, HCX:0, HCX Interconnect:0 |
| short-022 | HCX MON | HCX MON | MON:1, HCX:0, HCX MON:0 |
| short-022 | HCX OSAM | HCX OSAM | HCX:0, HCX OSAM:0, OSAM:0 |
| short-022 | HCX RAV | HCX RAV | HCX:0, HCX RAV:0, RAV:0 |
| short-022 | HCX Tunnel | Tunnel HCX | Tunnel:2, HCX:0, HCX Tunnel:0 |
| short-022 | HCX vMotion | HCX vMotion | HCX:0 |
| short-022 | Headroom | Margine disponibile | Headroom:0 |
| short-022 | HEALTHCHECK | HEALTHCHECK | HEALTHCHECK:0 |
| short-022 | Hecto | Etto | Hecto:0 |
| short-022 | Hertz | Hertz | Hertz:1 |
| short-022 | Heterogeneous vGPU | vGPU eterogenea | Heterogeneous:0 |
| long-013 | Hierarchical Inheritance | Ereditarietà gerarchica | Inheritance:2, Hierarchical:0, Hierarchical Inheritance:0 |
| short-022 | High-Availability | Disponibilità elevata | High-Availability:0 |
| short-023 | HIPAA | HIPAA | HIPAA:0 |
| short-023 | HSP | HSP | HSP:1 |
| short-023 | HWP | HWP | HWP:0 |
| long-014 | Identical adjacent characters | Caratteri adiacenti identici | Identical:2 |
| short-024 | IDFW | IDFW | IDFW:0 |
| long-014 | IDFW heterogeneous group | Gruppo eterogeneo IDFW | IDFW:0 |
| long-014 | IDFW homogeneous group | Gruppo omogeneo IDFW | IDFW:0 |
| short-024 | IKE SA | SA IKE | IKE:0, IKE SA:0 |
| short-024 | IKE-Flex | IKE-Flex | IKE-Flex:0 |
| short-024 | IKEv1 | IKEv1 | IKEv1:0 |
| short-024 | IKEv2 | IKEv2 | IKEv2:0 |
| short-024 | In (GFW direction) | In entrata (direzione GFW) | GFW:0 |
| short-024 | In-Out | Entrata/Uscita | In-Out:0 |
| short-024 | In-Out (direction) | Entrata/Uscita (direzione) | In-Out:0 |
| long-014 | In-product feedback (IPF) | Feedback nel prodotto (IPF) | In-product:0, IPF:0 |
| long-014 | In-product Marketplace | Marketplace nel prodotto | In-product:0, In-product Marketplace:0, Marketplace:0 |
| short-024 | In-Service | In servizio | In-Service:0 |
| short-024 | Industrial vSwitch | vSwitch industriale | Industrial:0 |
| long-015 | Informational (update type) | Informativo (tipo di aggiornamento) | Informational:1 |
| short-024 | Injected | Inserito | Injected:2 |
| short-024 | Inline mode | Modalità inline | Inline:0 |
| short-025 | Integrations | Integrazioni | Integrations:0 |
| short-025 | Integrations page | Pagina delle integrazioni | Integrations:0 |
| long-015 | Intelligent alert clustering | Clustering intelligente degli avvisi | Intelligent:0 |
| short-025 | Inter-Location | Tra posizioni | Inter-Location:0 |
| short-025 | Intercept | Intercetta | Intercept:0 |
| short-025 | Interconnect | Interconnessione | Interconnect:1 |
| short-025 | Interconnect (IX) | Interconnessione (IX) | Interconnect:1, Interconnect IX:0 |
| short-025 | Inventories | Inventari | Inventories:0 |
| short-025 | IP Ranges | Intervalli IP | Ranges:2 |
| short-025 | IP-HASH | IP-HASH | IP-HASH:0 |
| short-025 | IPAM | IPAM | IPAM:0 |
| short-025 | IPAM (nav) | IPAM (navigazione) | IPAM:0 |
| short-025 | IPAM (quota) | IPAM (quota) | IPAM:0 |
| short-026 | iSCSI SendTargets | iSCSI SendTargets | SendTargets:0 |
| long-015 | JavaScript (Orchestrator) | JavaScript (Orchestrator) | Orchestrator:1, JavaScript:0, JavaScript Orchestrator:0 |
| short-026 | Joule | Joule | Joule:1 |
| short-026 | KDK | KDK | KDK:0 |
| long-016 | KeyName not configured. | KeyName non configurato. | KeyName:0 |
| short-026 | KeyStore error | Errore del keystore | KeyStore:0 |
| short-026 | L2 VPN | VPN L2 | VPN:0 |
| short-026 | L2VPN EVPN | L2VPN EVPN | L2VPN:0, L2VPN EVPN:0, EVPN:0 |
| short-027 | Launchpad | Launchpad | Launchpad:0 |
| short-027 | LB XLarge | LB extra grande | XLarge:0 |
| short-027 | LB-BYTES | LB-BYTES | LB-BYTES:0 |
| short-027 | LCM | LCM | LCM:0 |
| short-027 | LDAPs | LDAPs | LDAPs:0 |
| short-027 | LDAPS (protocol) | LDAPS (protocollo) | LDAPS:0 |
| short-027 | LI-TLS | LI-TLS | LI-TLS:0 |
| short-028 | Linear | Lineare | Linear:1 |
| long-016 | Linking vCenter instances | Collegamento delle istanze di vCenter | Linking:0 |
| short-028 | LLDP | LLDP | LLDP:0 |
| short-028 | LM and VIP (cert) | LM e VIP (certificato) | VIP:1 |
| short-028 | LM-Owned | Di proprietà di LM | LM-Owned:0 |
| short-028 | Log-based alert | Avviso basato su registri | Log-based:0 |
| short-028 | Logarithmic | Logaritmico | Logarithmic:0 |
| short-029 | LTA | LTA | LTA:0 |
| short-029 | Lux | Lux | Lux:0 |
| short-029 | MaintenanceMode | MaintenanceMode | MaintenanceMode:0 |
| short-029 | Malware Verdict | Verdetto malware | Malware:1, Malware Verdict:0, Verdict:0 |
| short-029 | Mar | Mar | Mar:0 |
| short-030 | MD5 (OSPF auth) | MD5 (autenticazione OSPF) | MD5:1, MD5 OSPF:0, OSPF:0 |
| short-030 | MDT | MDT | MDT:0 |
| short-030 | Mega | Mega | Mega:0 |
| short-030 | Megahertz | Megahertz | Megahertz:1 |
| short-030 | MEMCTL max | MEMCTL max | MEMCTL:2 |
| short-030 | Micro | Micro | Micro:1 |
| short-030 | Micro-Segmentation | Microsegmentazione | Micro-Segmentation:0 |
| short-030 | Micro-segmentation | Microsegmentazione | Micro-segmentation:0 |
| long-018 | Micro-segmentation (OFN) | Micro-segmentazione (OFN) | Micro-segmentation:0, Micro-segmentation OFN:0, OFN:0 |
| short-030 | Micro-Segments | Microsegmenti | Micro-Segments:0 |
| short-030 | Milli | Milli | Milli:1 |
| short-030 | MITRE ATT&CK | MITRE ATT&CK | MITRE:0, MITRE ATT:0, ATT:0 |
| short-030 | MITRE Tactic | Tattica MITRE | MITRE:0, MITRE Tactic:0, Tactic:0 |
| short-030 | MITRE Technique | Tecnica MITRE | Technique:1, MITRE:0, MITRE Technique:0 |
| short-030 | MixedSize (vGPU) | Dimensioni miste (vGPU) | MixedSize:0 |
| short-030 | Modem | Modem | Modem:0 |
| short-031 | MON | Lun | MON:1 |
| short-031 | Motherboard model | Modello della scheda madre | Motherboard:0 |
| short-031 | MPIT | MPIT | MPIT:0 |
| short-031 | MPLS | MPLS | MPLS:0 |
| short-031 | MTEP | MTEP | MTEP:0 |
| short-031 | Multi-NIC vMotion | vMotion multi-NIC | Multi-NIC:0 |
| short-031 | Multi-site | Multisito | Multi-site:0 |
| short-031 | Multi-Tenancy | Multi-tenancy | Multi-Tenancy:0 |
| short-031 | Multi-TEP | Multi-TEP | Multi-TEP:0 |
| short-031 | Multipath | Multipath | Multipath:1 |
| short-031 | Multipath Relax | Rilassamento multipath | Multipath:1, Multipath Relax:0, Relax:0 |
| short-031 | Multipathing | Multipathing | Multipathing:1 |
| short-031 | My Deployments | Le mie distribuzioni | Deployments:2 |
| long-018 | NamedCurve is missing. | NamedCurve mancante. | NamedCurve:0 |
| short-031 | Nano | Nano | Nano:0 |
| short-031 | NAPP | NAPP | NAPP:0 |
| short-031 | Navigates to | Passa a | Navigates:1 |
| long-019 | Navigates to vCenter server | Passa a vCenter Server | Navigates:1 |
| short-031 | Navigator | Navigatore | Navigator:0 |
| short-031 | NBS | NBS | NBS:0 |
| short-031 | NDR | NDR | NDR:0 |
| short-032 | NetworkPolicy | NetworkPolicy | NetworkPolicy:0 |
| short-032 | New VCF Fleet | Nuovo VCF Fleet | VCF:0, VCF Fleet:0, Fleet:0 |
| short-033 | NFS41 | NFS41 | NFS41:0 |
| short-033 | NIST | NIST | NIST:1 |
| long-019 | No applicable VCFs found | Nessun VCF applicabile trovato | VCFs:0 |
| short-033 | NO DNAT | NESSUN DNAT | DNAT:0 |
| long-019 | No or unsupported key in KeyValue. | Chiave assente o non supportata in KeyValue. | KeyValue:1 |
| short-033 | No Prepend | Nessun prepend | Prepend:0 |
| short-033 | NO SNAT | NESSUN SNAT | SNAT:0 |
| short-033 | NodeClass | NodeClass | NodeClass:0 |
| short-033 | Non-Preemptive | Non preemptive | Non-Preemptive:0 |
| long-020 | Non-Preemptive (failover) | Non preemptive (failover) | Non-Preemptive:0 |
| long-020 | Non-preemptive (T1 failover) | Non preemptive (failover T1) | Non-preemptive:0, Non-preemptive T1:0 |
| short-033 | Non-Propagating | Non propagante | Non-Propagating:0 |
| short-033 | Non-Stretched | Non esteso | Non-Stretched:0 |
| long-020 | Non-VM (user objects) usage | Utilizzo non VM (oggetti utente) | Non-VM:2 |
| long-020 | Non-VM user objects usage | Utilizzo degli oggetti utente non VM | Non-VM:2 |
| short-033 | North-South | Nord-sud | North-South:0 |
| short-033 | Not Drifted | Nessuna deviazione | Drifted:0 |
| short-033 | Not Realized | Non realizzato | Realized:0 |
| short-034 | Nov | Nov | Nov:0 |
| short-034 | NSSA | NSSA | NSSA:0 |
| short-034 | NSX-V | NSX-V | NSX-V:0 |
| long-020 | NtlmAuthentication (app) | NtlmAuthentication (app) | NtlmAuthentication:0 |
| short-034 | OAuth 2.0 | OAuth 2.0 | OAuth:2 |
| short-035 | Observation | Osservazione | Observation:1 |
| short-035 | Observations | Osservazioni | Observations:0 |
| long-020 | OCSP responder location | Posizione del responder OCSP | OCSP:0 |
| short-035 | ODS | ODS | ODS:0 |
| long-020 | ODS (on demand system) | ODS (sistema on demand) | ODS:0 |
| short-035 | OIDC | OIDC | OIDC:0 |
| short-035 | OIDC (VKS) | OIDC (VKS) | OIDC:0, OIDC VKS:0, VKS:0 |
| short-035 | Okta | Okta | Okta:0 |
| short-035 | On-premises (ABX) | On-premise (ABX) | On-premises:0, On-premises ABX:0, ABX:0 |
| long-020 | On-Premises (router location) | On-premise (posizione del router) | On-Premises:0 |
| short-035 | OpenLDAP | OpenLDAP | OpenLDAP:0 |
| short-035 | OpenSSL | OpenSSL | OpenSSL:2 |
| short-035 | Optimize | Ottimizza | Optimize:2 |
| long-021 | Optimize (deployment) | Ottimizza (distribuzione) | Optimize:2 |
| short-035 | Orchestrate | Orchestra | Orchestrate:1 |
| short-035 | Orchestrator | Orchestrator | Orchestrator:1 |
| short-035 | Organization | Organizzazione | Organization:2 |
| long-021 | Organization description | Descrizione dell'organizzazione | Organization:2 |
| long-021 | Organization for All Apps | Organizzazione per tutte le app | Organization:2, Apps:0 |
| short-035 | Organization name | Nome organizzazione | Organization:2 |
| short-035 | Organizations | Organizzazioni | Organizations:0 |
| long-021 | Organizations (automation) | Organizzazioni (automazione) | Organizations:0 |
| short-035 | OSAM | OSAM | OSAM:0 |
| short-035 | OSImage | OSImage | OSImage:0 |
| short-035 | OSPF | OSPF | OSPF:0 |
| short-035 | OSPF Neighbors | Neighbor OSPF | OSPF:0, OSPF Neighbors:0, Neighbors:0 |
| short-035 | OSPF toggle | Attiva/disattiva OSPF | OSPF:0 |
| short-035 | OSPFv2 | OSPFv2 | OSPFv2:0 |
| long-021 | Over-commitment ratio: | Rapporto di over commit: | Over-commitment:1 |
| long-021 | Overlay-backed segments | Segmenti basati su overlay | Overlay-backed:0 |
| short-035 | Oversized | Sovradimensionato | Oversized:0 |
| short-036 | P2P | P2P | P2P:0 |
| short-036 | P2P (OSPF) | P2P (OSPF) | P2P:0, P2P OSPF:0, OSPF:0 |
| short-036 | PackageInstall | PackageInstall | PackageInstall:0 |
| long-021 | Parents (alert scope) | Elementi principali (ambito dell'avviso) | Parents:1 |
| short-036 | PartnerSupported | PartnerSupported | PartnerSupported:1 |
| short-036 | Passphrase | Frase d'accesso | Passphrase:2 |
| short-036 | Passphrase (cert) | Frase d'accesso (certificato) | Passphrase:2 |
| short-036 | Paste | Incolla | Paste:1 |
| short-036 | Percentile 1 | Percentile 1 | Percentile:0 |
| short-036 | Percentile 5 | Percentile 5 | Percentile:0 |
| short-036 | Percentile 90 | Percentile 90 | Percentile:0 |
| short-036 | Percentile 95 | Percentile 95 | Percentile:0 |
| short-037 | Peta | Peta | Peta:0 |
| short-037 | PFTT | PFTT | PFTT:0 |
| short-037 | PHM | PHM | PHM:1 |
| short-037 | Photon (OS) | Photon (sistema operativo) | Photon:2, Photon OS:1 |
| short-037 | Pico | Pico | Pico:0 |
| short-037 | PIM | PIM | PIM:0 |
| short-037 | PIM-SM | PIM-SM | PIM-SM:0 |
| short-037 | Pin menu | Blocca menu | Pin:2 |
| short-037 | Pinniped | Pinniped | Pinniped:0 |
| short-037 | Pins and Dashboards | Elementi bloccati e dashboard | Dashboards:2, Pins:0 |
| short-037 | PKI (Orchestrator) | PKI (Orchestrator) | Orchestrator:1, PKI:0, PKI Orchestrator:0 |
| long-022 | PKIXCertPathReviewer: the CertPath is empty. | PKIXCertPathReviewer: CertPath è vuoto. | PKIXCertPathReviewer:0, CertPath:0 |
| long-022 | Placeholder datastore | Datastore segnaposto | Placeholder:2 |
| long-022 | Placeholder for the deprecated X.Org Xserver. | Segnaposto per X.Org Xserver deprecato. | Placeholder:2, Org:1, Org Xserver:0 |
| short-037 | Placeholder VM | Macchina virtuale segnaposto | Placeholder:2, Placeholder VM:0 |
| long-022 | Planning and Preparation | Pianificazione e preparazione | Planning:2, Preparation:0 |
| long-022 | Pod-to-external traffic | Traffico da pod a esterno | Pod-to-external:0 |
| short-037 | Pod-to-pod traffic | Traffico tra pod | Pod-to-pod:0 |
| long-022 | podvm-router routes traffic coming from PodVM when using vds-vsip load | podvm-router instrada il traffico proveniente da PodVM quando si utili | PodVM:0 |
| short-037 | Policy-As-Code | Criterio come codice | Policy-As-Code:0 |
| long-022 | Port-level configuration reset | Reimpostazione della configurazione a livello di porta | Port-level:0 |
| short-037 | Posixid | Posixid | Posixid:0 |
| short-037 | Post-copy | Post-copia | Post-copy:0 |
| short-037 | Postcustomization | Post-personalizzazione | Postcustomization:0 |
| long-022 | PowerShell (Orchestrator) | PowerShell (Orchestrator) | Orchestrator:1, PowerShell:0, PowerShell Orchestrator:0 |
| short-038 | PowerShell (runtime) | PowerShell (runtime) | PowerShell:0 |
| short-038 | Pre-defined | Predefinito | Pre-defined:2 |
| short-038 | Pre-Rules | Regole pre | Pre-Rules:0 |
| short-038 | Precheks | Verifiche preliminari | Precheks:0 |
| short-038 | Precustomization | Pre-personalizzazione | Precustomization:0 |
| short-038 | Preemptive | Con prelazione | Preemptive:0 |
| long-022 | Preemptive (failover) | Con prelazione (failover) | Preemptive:0 |
| long-022 | Preemptive (T1 failover) | Con prelazione (failover T1) | Preemptive:0, Preemptive T1:0 |
| short-038 | Price | Prezzo | Price:0 |
| short-038 | Price (deployment) | Prezzo (distribuzione) | Price:0 |
| short-038 | Privacy | Privacy | Privacy:1 |
| short-038 | Privacy (krb5p) | Privacy (krb5p) | Privacy:1 |
| short-038 | Progressive Pair-Sum | Somma progressiva a coppie | Progressive:0, Progressive Pair-Sum:0, Pair-Sum:0 |
| long-022 | Project-specific view | Vista specifica del progetto | Project-specific:0 |
| short-038 | Projects | Progetti | Projects:1 |
| long-023 | Projects (automation) | Progetti (automazione) | Projects:1 |
| short-039 | PRP | PRP | PRP:1 |
| short-039 | PSI | PSI | PSI:0 |
| short-039 | PSK | PSK | PSK:0 |
| short-039 | PTP daemon | Daemon PTP | PTP:2 |
| short-039 | PVC | PVC | PVC:1 |
| short-039 | PVRDMAAsyncIOWorlds | PVRDMAAsyncIOWorlds | PVRDMAAsyncIOWorlds:0 |
| short-039 | PVSCSI | PVSCSI | PVSCSI:2 |
| short-039 | Q-Series vGPU | vGPU serie Q | Q-Series:0 |
| short-039 | QuadWords | QuadWords | QuadWords:0 |
| short-039 | QuarantineMode | QuarantineMode | QuarantineMode:0 |
| short-039 | RAV | RAV | RAV:0 |
| short-039 | RBAC | RBAC | RBAC:0 |
| short-039 | RDU | RDU | RDU:0 |
| long-023 | RDU (vCenter upgrade) | RDU (aggiornamento di vCenter) | RDU:0 |
| short-039 | ReadSize=64K. | ReadSize=64K. | ReadSize:0 |
| long-023 | Realization (Federation) | Realizzazione (federazione) | Realization:2, Federation:1, Realization Federation:0 |
| short-039 | Realized | Realizzato | Realized:0 |
| short-040 | Recents (dashboard) | Recenti (dashboard) | Recents:0 |
| short-040 | Recents (dashboards) | Recenti (dashboard) | Recents:0 |
| short-040 | Recipient(s) | Destinatari | Recipient:0 |
| short-040 | Reclaimable | Recuperabile | Reclaimable:2 |
| long-023 | Recursive key reference detected. | Rilevato riferimento a chiave ricorsivo. | Recursive:2 |
| short-040 | Redeploy | Ridistribuisci | Redeploy:1 |
| short-040 | Redistribute Tier-1 | Ridistribuisci route Tier-1 | Redistribute:0, Redistribute Tier-1:0, Tier-1:0 |
| short-040 | Reflexive | Riflessivo | Reflexive:0 |
| short-040 | Regulatory | Normativo | Regulatory:0 |
| long-023 | Regulatory benchmarks | Benchmark normativi | Regulatory:0 |
| short-040 | Reject (approval) | Rifiuta (approvazione) | Reject:1 |
| short-040 | Reject (firewall) | Rifiuta (firewall) | Reject:1 |
| short-040 | Reject (GFW action) | Rifiuta (azione GFW) | Reject:1, Reject GFW:0, GFW:0 |
| short-040 | Reject (policy) | Rifiuta (criterio) | Reject:1 |
| long-024 | Reorder dashboard tabs | Riordina le schede del dashboard | Reorder:2 |
| short-041 | Repeatedly (action) | Ripetutamente (azione) | Repeatedly:0 |
| short-041 | Repeater | Ripetitore | Repeater:0 |
| short-041 | Replications | Repliche | Replications:0 |
| short-041 | Replications tab | Scheda Repliche | Replications:0 |
| short-041 | Repoint vCenter | Reindirizza vCenter | Repoint:0 |
| short-041 | Reprotect | Riproteggi | Reprotect:0 |
| short-041 | Reprovisioning | Nuovo provisioning | Reprovisioning:0 |
| short-041 | Requester | Richiedente | Requester:0 |
| short-041 | Requestor | Richiedente | Requestor:0 |
| short-041 | Resolver | Resolver | Resolver:0 |
| short-041 | ResourcePolicy | ResourcePolicy | ResourcePolicy:0 |
| long-024 | Retrace the Traceflow | Esegui di nuovo il Traceflow | Retrace:0, Traceflow:0 |
| short-042 | REWRITE (cookie) | RISCRITTURA (cookie) | REWRITE:0 |
| short-042 | Right-click menu | Menu di scelta rapida | Right-click:1 |
| short-042 | Right-size | Ridimensiona correttamente | Right-size:0 |
| short-042 | Right-Size | Ridimensiona correttamente | Right-Size:0 |
| short-042 | Rightsize | Ridimensiona correttamente | Rightsize:0 |
| short-042 | Rightsizing | Ridimensionamento corretto | Rightsizing:0 |
| short-042 | Role-Based Approval | Approvazione basata sui ruoli | Role-Based:0, Role-Based Approval:0, Approval:0 |
| short-042 | Rollups | Rollup | Rollups:0 |
| short-042 | Route-based VPN | VPN basata su route | Route-based:0, Route-based VPN:0, VPN:0 |
| short-042 | Routed (network) | Instradata (rete) | Routed:0 |
| short-042 | RSA | RSA | RSA:2 |
| short-042 | RSA-2048 | RSA-2048 | RSA-2048:0 |
| short-042 | RTEP | RTEP | RTEP:0 |
| short-043 | Runbook | Runbook | Runbook:0 |
| short-043 | Runbooks | Runbook | Runbooks:0 |
| short-043 | RuntimeClass (TKG) | RuntimeClass (TKG) | RuntimeClass:0, RuntimeClass TKG:0, TKG:0 |
| short-043 | Salt | Salt | Salt:0 |
| short-043 | SameSize (vGPU) | SameSize (vGPU) | SameSize:0 |
| short-043 | Scales | Scale | Scales:0 |
| short-043 | Scenario | Scenario | Scenario:2 |
| short-043 | SCIM | SCIM | SCIM:0 |
| long-025 | Scoreboard (for selected VM) | Classifica (per la macchina virtuale selezionata) | Scoreboard:1 |
| short-043 | Scoreboard Widget | Widget scoreboard | Scoreboard:1, Scoreboard Widget:0, Widget:0 |
| long-025 | SecurityProperties must not be null! | SecurityProperties non deve essere null! | SecurityProperties:0 |
| short-044 | SEL entries | Voci SEL | SEL:0 |
| short-044 | Self-Signed | Autofirmato | Self-Signed:2 |
| short-044 | Sentinel (SEN) | Sentinel (SEN) | Sentinel:0, Sentinel SEN:0, SEN:0 |
| short-045 | Set Subnets | Imposta subnet | Subnets:2 |
| short-045 | SEV-ES | SEV-ES | SEV-ES:0 |
| short-045 | SEV-SNP (VM) | SEV-SNP (VM) | SEV-SNP:0, SEV-SNP VM:0 |
| short-045 | Sever | Interrompi | Sever:1 |
| short-045 | SHA2 256 | SHA2 256 | SHA2:0 |
| short-045 | SHA2 384 | SHA2 384 | SHA2:0 |
| short-045 | SHA2 512 | SHA2 512 | SHA2:0 |
| short-045 | Shallow Recrypt | Ricrittografia superficiale | Shallow:2, Recrypt:1, Shallow Recrypt:0 |
| short-045 | Shallow recryption | Ricrittografia superficiale | Shallow:2 |
| short-045 | ShallowRekey | ShallowRekey | ShallowRekey:0 |
| short-045 | Shift | Maiusc | Shift:2 |
| short-045 | Shortcuts | Collegamenti | Shortcuts:0 |
| short-045 | Showback | Showback | Showback:0 |
| short-045 | Siemens | Siemens | Siemens:0 |
| short-046 | Signatures | Firme | Signatures:0 |
| short-046 | SILENCED (precheck) | SILENZIATA (verifica preliminare) | SILENCED:1 |
| short-046 | Singleton | Singleton | Singleton:0 |
| short-046 | Sink port | Porta sink | Sink:0 |
| long-026 | Site-level Resilience | Resilienza a livello di sito | Resilience:2, Site-level:0, Site-level Resilience:0 |
| short-046 | Slack | Slack | Slack:1 |
| short-046 | Slave | Slave | Slave:2 |
| short-046 | SNAT | SNAT | SNAT:0 |
| short-046 | SNAT (VPC) | SNAT (VPC) | VPC:1, SNAT:0, SNAT VPC:0 |
| short-046 | Solicit | Solicit | Solicit:0 |
| long-027 | Sorry, but you cannot use a AlgorithmParameterSpec object for creating | Non è possibile utilizzare un oggetto AlgorithmParameterSpec per crear | Sorry:0, AlgorithmParameterSpec:0, DSA:0 |
| long-027 | Sorry, but you cannot use a AlgorithmParameterSpec object for creating | Non è possibile utilizzare un oggetto AlgorithmParameterSpec per crear | RSA:2, Sorry:0, AlgorithmParameterSpec:0 |
| long-027 | Sorry, but you cannot use a SecureRandom object for creating MACs. | Non è possibile utilizzare un oggetto SecureRandom per creare MAC. | MACs:2, Sorry:0, SecureRandom:0 |
| short-046 | SoS | SoS | SoS:0 |
| short-046 | Sparkline | Sparkline | Sparkline:0 |
| short-047 | Splitter collapsed | Divisore compresso | Splitter:0 |
| short-047 | Splitter restored | Divisore ripristinato | Splitter:0 |
| short-047 | SpoofGuard | SpoofGuard | SpoofGuard:0 |
| short-047 | Spread (placement) | Spread (posizionamento) | Spread:1 |
| short-047 | SRA | SRA | SRA:0 |
| short-047 | State-based alarm | Allarme basato sullo stato | State-based:0 |
| short-047 | STIG | STIG | STIG:0 |
| short-048 | StorageClass | StorageClass | StorageClass:0 |
| short-048 | Stub | Stub | Stub:0 |
| short-048 | Subjects | Soggetti | Subjects:1 |
| long-028 | Subnet-VLAN Enrichment | Arricchimento subnet-VLAN | Subnet-VLAN:0, Subnet-VLAN Enrichment:0, Enrichment:0 |
| short-048 | Subnets | Subnet | Subnets:2 |
| long-028 | Subnets cannot overlap | Le subnet non possono sovrapporsi | Subnets:2 |
| long-028 | Subscribers (library) | Sottoscrittori (libreria) | Subscribers:2 |
| short-048 | Subtype | Sottotipo | Subtype:1 |
| short-048 | Summation (rollup) | Sommatoria (rollup) | Summation:2 |
| short-048 | Superseded | Sostituito | Superseded:1 |
| short-048 | Supervisors | Supervisor | Supervisors:0 |
| long-028 | SupervisorService CRD | CRD SupervisorService | SupervisorService:0, SupervisorService CRD:0, CRD:0 |
| short-048 | Suppress | Elimina | Suppress:1 |
| long-028 | Suricata-Based Signatures | Firme basate su Suricata | Suricata-Based:0, Suricata-Based Signatures:0, Signatures:0 |
| short-049 | Synthetic Timers | Timer sintetici | Synthetic:0, Synthetic Timers:0, Timers:0 |
| short-049 | System-wide users | Utenti a livello di sistema | System-wide:1 |
| short-049 | SystemBoard | Scheda di sistema | SystemBoard:1 |
| short-049 | T0 Active-Active | T0 attivo-attivo | Active-Active:0 |
| short-049 | T0 Active-Standby | T0 attivo-standby | Active-Standby:0 |
| short-049 | Tag-based exclusion | Esclusione basata su tag | Tag-based:0 |
| short-050 | Telegraf | Telegraf | Telegraf:0 |
| short-050 | TEP | TEP | TEP:0 |
| short-050 | TEP IP | IP TEP | TEP:0, TEP IP:0 |
| short-050 | Tera | Tera | Tera:0 |
| short-050 | Terabyte | Terabyte | Terabyte:0 |
| long-029 | Term-based subscription | Sottoscrizione a termine | Term-based:0 |
| long-029 | Terraform configurations | Configurazioni Terraform | Terraform:0 |
| short-050 | TFC | TFC | TFC:0 |
| short-050 | TGW | TGW | TGW:0 |
| long-029 | The DN of the TrustAnchor is improperly specified. | Il DN di TrustAnchor non è specificato correttamente. | TrustAnchor:0 |
| long-029 | The tier-1 gateway must be in the Active-Standby mode. | Il gateway Tier-1 deve essere in modalità attivo-standby. | Active-Standby:0 |
| long-029 | The use of MD5 algorithm is strongly discouraged. Nonetheless can it b | L'uso dell'algoritmo MD5 è fortemente sconsigliato. È comunque possibi | MD5:1, Nonetheless:0, AllowMD5Algorithm:0 |
| long-029 | The XPath is not in the same document as the context node | L'XPath non si trova nello stesso documento del nodo di contesto | XPath:0 |
| long-029 | This package contains dvfilter-generic-fastpath(TrafficFilter) module. | Questo pacchetto contiene il modulo dvfilter-generic-fastpath(TrafficF | TrafficFilter:0 |
| short-050 | Threat Intelligence | Intelligence sulle minacce | Threat:0, Threat Intelligence:0, Intelligence:0 |
| short-050 | TiB (license) | TiB (licenza) | TiB:0 |
| short-050 | TiB entitlement | Diritto TiB | TiB:0 |
| short-050 | Tier-0 (segment) | Tier-0 (segmento) | Tier-0:0 |
| short-050 | Tier-0 VRF | VRF Tier-0 | Tier-0:0, Tier-0 VRF:0, VRF:0 |
| short-050 | Tier-1 (segment) | Tier-1 (segmento) | Tier-1:0 |
| short-050 | Tier-1 Downlinks | Downlink Tier-1 | Tier-1:0, Tier-1 Downlinks:0, Downlinks:0 |
| long-029 | Tier-1 gateway (LB attachment) | Gateway Tier-1 (collegamento LB) | Tier-1:0 |
| short-050 | Time-based rule | Regola basata sul tempo | Time-based:0 |
| short-050 | Timespan | Intervallo di tempo | Timespan:1 |
| short-050 | Timespan: | Intervallo di tempo: | Timespan:1 |
| short-050 | TKC | TKC | TKC:0 |
| short-050 | TKG | TKG | TKG:0 |
| short-050 | TKR | TKR | TKR:0 |
| short-050 | TMC | TMC | TMC:0 |
| short-050 | TNP | TNP | TNP:0 |
| short-051 | Traceflow | Traceflow | Traceflow:0 |
| long-029 | Traceflow (Federation) | Traceflow (Federation) | Federation:1, Traceflow:0, Traceflow Federation:0 |
| short-051 | Transformation | Trasformazione | Transformation:0 |
| short-051 | Translated IP | IP tradotto | Translated:2, Translated IP:0 |
| short-051 | Transparent (SNAT) | Trasparente (SNAT) | Transparent:0, Transparent SNAT:0, SNAT:0 |
| short-051 | Transparent bridge | Bridge trasparente | Transparent:0 |
| short-051 | Trending | Andamento | Trending:2 |
| short-051 | TTL | TTL | TTL:1 |
| short-051 | Tunnel mode | Modalità tunnel | Tunnel:2 |
| short-051 | ULM | ULM | ULM:0 |
| short-051 | Unaccessed | Non consultato | Unaccessed:0 |
| short-051 | Uncommitted | Non impegnato | Uncommitted:2 |
| short-051 | Undersized | Sottodimensionato | Undersized:1 |
| short-052 | Unprivileged | Senza privilegi | Unprivileged:0 |
| short-052 | Unpublish | Annulla pubblicazione | Unpublish:0 |
| short-052 | Unselected | Non selezionato | Unselected:0 |
| short-052 | Unsuppress | Annulla eliminazione | Unsuppress:0 |
| short-052 | Uplink1 | Uplink1 | Uplink1:0 |
| short-052 | Uplink2 | Uplink2 | Uplink2:0 |
| short-052 | UPN | UPN | UPN:0 |
| short-052 | Urgency | Urgenza | Urgency:0 |
| short-052 | Use StartTLS | Utilizza StartTLS | StartTLS:0 |
| short-053 | User-Based Approval | Approvazione basata sull'utente | User-Based:0, User-Based Approval:0, Approval:0 |
| short-053 | V3Targets | V3Targets | V3Targets:0 |
| short-053 | vApp Author | Autore della vApp | Author:2 |
| short-053 | VBS | VBS | VBS:0 |
| short-053 | vCenter Linking | Collegamento di vCenter | Linking:0 |
| short-053 | VCF | VCF | VCF:0 |
| short-053 | VCF benchmarks | Benchmark di VCF | VCF:0 |
| short-053 | VCF Bring-Up | Bring-Up di VCF | VCF:0, VCF Bring-Up:0, Bring-Up:0 |
| short-053 | VCF Converge | Convergenza di VCF | Converge:1, VCF:0, VCF Converge:0 |
| short-053 | VCF Fleet | VCF Fleet | VCF:0, VCF Fleet:0, Fleet:0 |
| short-053 | VCF OFN | VCF OFN | VCF:0, VCF OFN:0, OFN:0 |
| short-053 | VCF Orchestrator | VCF Orchestrator | Orchestrator:1, VCF:0, VCF Orchestrator:0 |
| short-053 | VCF services runtime | Runtime dei servizi VCF | VCF:0 |
| short-053 | VCF version | Versione di VCF | VCF:0 |
| short-054 | vDefend ATP | vDefend ATP | ATP:0 |
| long-031 | Versioning (Orchestrator) | Controllo delle versioni (Orchestrator) | Orchestrator:1, Versioning:0, Versioning Orchestrator:0 |
| short-054 | VGFA | VGFA | VGFA:0 |
| short-054 | Victim IP | IP della vittima | Victim:0, Victim IP:0 |
| short-054 | VIDB (cert) | VIDB (certificato) | VIDB:0 |
| short-054 | VIDM | vIDM | VIDM:0 |
| long-032 | Viewer (namespace role) | Visualizzatore (ruolo dello spazio dei nomi) | Viewer:0 |
| short-054 | VIF | VIF | VIF:0 |
| short-054 | VIFs | VIFs | VIFs:0 |
| short-054 | VIP | VIP | VIP:1 |
| long-032 | VirtualMachineClass (binding) | VirtualMachineClass (binding) | VirtualMachineClass:0 |
| short-054 | Visualization Canvas | Canvas di visualizzazione | Visualization:0, Visualization Canvas:0, Canvas:0 |
| short-054 | Visualize | Visualizza | Visualize:0 |
| short-054 | VKr 1.32 | VKr 1.32 | VKr:0 |
| short-054 | VKS | VKS | VKS:0 |
| short-055 | VLAN-backed | Basato su VLAN | VLAN-backed:0 |
| short-055 | VLAN-backed segments | Segmenti basati su VLAN | VLAN-backed:0 |
| long-032 | VM Apps Organizations | Organizzazioni VM Apps | Apps:0, Apps Organizations:0, Organizations:0 |
| short-055 | VM vNIC (Traceflow) | vNIC della macchina virtuale (Traceflow) | Traceflow:0 |
| long-033 | VMCA-signed certificate | Certificato firmato da VMCA | VMCA-signed:0 |
| short-055 | VMCP | VMCP | VMCP:1 |
| short-055 | VMFS6 | VMFS6 | VMFS6:1 |
| short-055 | VMKMEM minfree | VMKMEM minfree | VMKMEM:1 |
| short-055 | VMKMEM ursvd | VMKMEM ursvd | VMKMEM:1 |
| short-055 | VMSD | VMSD | VMSD:1 |
| short-055 | VMSN | VMSN | VMSN:2 |
| short-055 | VMware-certified | Certificato VMware | VMware-certified:0 |
| short-055 | VMwareAccepted | VMwareAccepted | VMwareAccepted:1 |
| short-055 | VMwareCertified | VMwareCertified | VMwareCertified:1 |
| short-055 | VMX-22 | VMX-22 | VMX-22:0 |
| short-056 | VNAC | VNAC | VNAC:0 |
| short-056 | VNI | VNI | VNI:0 |
| short-056 | VPC | VPC | VPC:1 |
| short-056 | VPC (namespace) | VPC (spazio dei nomi) | VPC:1 |
| short-056 | VPC in vCenter | VPC in vCenter | VPC:1 |
| short-056 | VPC subnets | Subnet del VPC | VPC:1 |
| short-056 | VPC Subnets (HCX) | Subnet del VPC (HCX) | Subnets:2, VPC:1, VPC Subnets:1 |
| short-056 | VPC-Ready | Pronto per VPC | VPC-Ready:0 |
| short-056 | VPCs (quota) | VPC (quota) | VPCs:0 |
| short-056 | VPN | VPN | VPN:0 |
| short-056 | VPN (stateful) | VPN (stateful) | VPN:0 |
| short-056 | VPN Tunnel | Tunnel VPN | Tunnel:2, VPN:0, VPN Tunnel:0 |
| short-056 | VPN Tunnel ID | ID del tunnel VPN | Tunnel:2, VPN:0, VPN Tunnel:0 |
| long-033 | VPN Tunnel ID (segment) | ID tunnel VPN (segmento) | Tunnel:2, VPN:0, VPN Tunnel:0 |
| short-056 | VRAM | VRAM | VRAM:2 |
| long-033 | vRealize Orchestrator | vRealize Orchestrator | Orchestrator:1 |
| short-056 | vRealize Suite | vRealize Suite | Suite:1 |
| short-056 | VRF | VRF | VRF:0 |
| short-056 | VRF Lite | VRF Lite | VRF:0, VRF Lite:0, Lite:0 |
| short-056 | vSAN Heatmap | Mappa termica vSAN | Heatmap:0 |
| short-056 | vSAN TiB | TiB vSAN | TiB:0 |
| short-056 | VSF | VSF | VSF:0 |
| short-056 | vSphere Dashboards | Dashboard di vSphere | Dashboards:2 |
| short-057 | VTEP | VTEP | VTEP:0 |
| short-057 | VTI | VTI | VTI:0 |
| short-057 | VXLAN | VXLAN | VXLAN:0 |
| short-057 | VXLAN Tunnel | Tunnel VXLAN | Tunnel:2, VXLAN:0, VXLAN Tunnel:0 |
| short-057 | Watt | Watt | Watt:2 |
| long-034 | Well-known configuration users' group which contains all configuration | Gruppo noto di utenti di configurazione che contiene come membri tutti | Well-known:1 |
| long-034 | Well-known external IDP users' group, which registers external IDP use | Gruppo noto di utenti IDP esterni che registra gli utenti IDP esterni  | IDP:2, Well-known:1 |
| long-034 | Well-known solution users' group, which contains all solution users as | Gruppo noto di utenti della soluzione che contiene come membri tutti g | Well-known:1 |
| short-057 | Widget | Widget | Widget:0 |
| short-057 | Widget interactions | Interazioni del widget | Widget:0 |
| short-057 | Widget Interactions | Interazioni del widget | Widget:0, Widget Interactions:0, Interactions:0 |
| short-057 | Widgets | Widget | Widgets:0 |
| short-057 | Workbench | Workbench | Workbench:0 |
| short-057 | Workflows | Workflow | Workflows:0 |
| long-034 | Workflows (Orchestrator) | Workflow (Orchestrator) | Orchestrator:1, Workflows:0, Workflows Orchestrator:0 |
| short-057 | Workgroup | Gruppo di lavoro | Workgroup:0 |
| long-034 | Workgroup (customization) | Gruppo di lavoro (personalizzazione) | Workgroup:0 |
| short-057 | Workgroup or domain | Gruppo di lavoro o dominio | Workgroup:0 |
| short-057 | WSFC | WSFC | WSFC:0 |
| short-057 | WWNN | WWNN | WWNN:1 |
| short-057 | WWPN | WWPN | WWPN:1 |
| short-057 | X-Forwarded-For | X-Forwarded-For | X-Forwarded-For:0 |
| short-057 | YAML editor | Editor YAML | YAML:0 |
| long-035 | YAML-Based Governance | Governance basata su YAML | YAML-Based:0, YAML-Based Governance:0, Governance:0 |
| short-057 | Yocto | Yocto | Yocto:0 |
| short-057 | Yotta | Yotta | Yotta:0 |
| long-035 | You have to XMLSignature.sign(java.security.PrivateKey) first | È necessario eseguire prima XMLSignature.sign(java.security.PrivateKey | XMLSignature:0, PrivateKey:0 |
| short-058 | Zepto | Zepto | Zepto:0 |
| short-058 | Zetta | Zetta | Zetta:0 |
| short-058 | ZTP | ZTP | ZTP:0 |

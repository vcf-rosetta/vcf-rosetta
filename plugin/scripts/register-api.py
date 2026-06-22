#!/usr/bin/env python3
"""Register (or unregister) the R1 remote plug-in directly via the vCenter
ExtensionManager API — no vSphere Client SDK download and no Java required.

This is the underlying mechanism the SDK registration tool wraps: it creates an
Extension whose server entry points at our plugin.json (over HTTPS, with the
TLS thumbprint) and whose client entry is a remote vSphere Client plug-in.

Install dep (once):   pip3 install --user pyvmomi
Register:             python3 register-api.py register
List ours:            python3 register-api.py list
Unregister:           python3 register-api.py unregister

Config via env (or edit defaults below):
  VC_HOST      vCenter FQDN/IP
  VC_USER      administrator@vsphere.local
  VC_PASS      password (omit to be prompted)
  PLUGIN_URL   https://<plugin-host>:8443/plugin.json
  THUMBPRINT   SHA-256 thumbprint, colon-separated (from get-thumbprint.sh)
  PLUGIN_KEY   com.vcfrosetta.r1probe
  VERSION      0.1.0
"""
import os
import ssl
import sys
import getpass
from datetime import datetime, timezone

try:
    from pyVim.connect import SmartConnect, Disconnect
    from pyVmomi import vim
except ImportError:
    sys.exit("ERROR: pyvmomi not installed. Run: pip3 install --user pyvmomi")

KEY = os.environ.get("PLUGIN_KEY", "com.vcfrosetta.r1probe")
VERSION = os.environ.get("VERSION", "0.1.2")
COMPANY = "vcf-rosetta"
LABEL = "VCF Rosetta R1 Probe"
SUMMARY = "R1 locale verification plug-in"


def connect():
    host = os.environ.get("VC_HOST") or sys.exit("set VC_HOST")
    user = os.environ.get("VC_USER", "administrator@vsphere.local")
    pwd = os.environ.get("VC_PASS") or getpass.getpass(f"Password for {user}@{host}: ")
    ctx = ssl._create_unverified_context()  # lab vCenter cert not trusted; fine for R1
    si = SmartConnect(host=host, user=user, pwd=pwd, sslContext=ctx)
    return si


def build_extension():
    plugin_url = os.environ.get("PLUGIN_URL") or sys.exit("set PLUGIN_URL")
    thumb = os.environ.get("THUMBPRINT") or sys.exit("set THUMBPRINT")

    desc = vim.Description(label=LABEL, summary=SUMMARY)

    # Modeled on a WORKING remote plugin on vCenter 9.1 (com.vmware.vrops.ui):
    #   client.type = vsphere-client-remote, url -> downloadable plugin.zip,
    #   server.type = HTTPS with self-signed cert thumbprint, url matching client.
    server = vim.Extension.ServerInfo(
        url=plugin_url,
        description=desc,
        company=COMPANY,
        type="HTTPS",
        adminEmail=["admin@vcf-rosetta.local"],
        serverThumbprint=thumb,
    )
    client = vim.Extension.ClientInfo(
        version=VERSION,
        description=desc,
        company=COMPANY,
        type="vsphere-client-remote",
        url=plugin_url,
    )
    return vim.Extension(
        key=KEY,
        version=VERSION,
        description=desc,
        company=COMPANY,
        server=[server],
        client=[client],
        lastHeartbeatTime=datetime.now(timezone.utc),
    )


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "register"
    si = connect()
    try:
        em = si.content.extensionManager
        existing = em.FindExtension(KEY)

        if action == "list":
            if existing:
                print(f"FOUND {KEY} v{existing.version}")
                for s in existing.server:
                    print(f"  server.url = {s.url}")
                    print(f"  thumbprint = {s.serverThumbprint}")
            else:
                print(f"NOT registered: {KEY}")
            return

        if action == "dump":
            # Dump the full extension structure of any key — use this to copy
            # exactly how a WORKING plugin on this vCenter is registered.
            #   python register-api.py dump com.vmware.lcm.client
            target = sys.argv[2] if len(sys.argv) > 2 else KEY
            ext = em.FindExtension(target)
            if not ext:
                print(f"NOT found: {target}")
                return
            print(f"=== {ext.key} v{ext.version} ===")
            print(f"shownInSolutionManager = {getattr(ext, 'shownInSolutionManager', None)}")
            print(f"subjectName = {getattr(ext, 'subjectName', None)}")
            for i, c in enumerate(ext.client or []):
                print(f"client[{i}].type    = {c.type}")
                print(f"client[{i}].url     = {c.url}")
                print(f"client[{i}].version = {c.version}")
                print(f"client[{i}].company = {c.company}")
            for i, s in enumerate(ext.server or []):
                print(f"server[{i}].type        = {s.type}")
                print(f"server[{i}].url         = {s.url}")
                print(f"server[{i}].adminEmail  = {s.adminEmail}")
                print(f"server[{i}].thumbprint  = {s.serverThumbprint}")
                print(f"server[{i}].company     = {s.company}")
            return

        if action == "unregister":
            if existing:
                em.UnregisterExtension(KEY)
                print(f"Unregistered {KEY}")
            else:
                print(f"Nothing to unregister ({KEY} not found)")
            return

        # register / update
        ext = build_extension()
        if existing:
            em.UpdateExtension(ext)
            print(f"Updated extension {KEY}")
        else:
            em.RegisterExtension(ext)
            print(f"Registered extension {KEY}")
        print("Now: log out/in of the vSphere Client, then check")
        print("  Administration > Solutions > Client Plug-Ins")
    finally:
        Disconnect(si)


if __name__ == "__main__":
    main()

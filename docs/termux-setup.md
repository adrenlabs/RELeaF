# Termux setup notes

RELeaF targets Android ARM64 with Termux, but exact package availability depends on the Termux repository and version.

## Base environment
Install Node.js 22+ and basic utilities using Termux's package manager:

```sh
pkg update
pkg install nodejs unzip file binutils
node --version
```

Optional analysis tools may include radare2/Rizin, JADX, and apktool. Check availability before assuming package names:

```sh
pkg search radare2
pkg search jadx
pkg search apktool
```

Enable shared-storage access only if your input files are under Android shared storage:

```sh
termux-setup-storage
```

This is a setup reference, not a claim that all components are already packaged for one-command installation. Follow the component-specific README once its source is available. Do not paste credentials into issues or chat.

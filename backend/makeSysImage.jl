using Pkg
# Install PackageCompiler in the base environment
Pkg.activate(".")
Pkg.instantiate()
Pkg.add("PackageCompiler")
Pkg.build("PackageCompiler")
using PackageCompiler

# Activate the Project Environment
# Build the sysimage
PackageCompiler.create_sysimage(;
    sysimage_path="julia_base.so",
    cpu_target="generic",
    sysimage_build_args=`-O3`
)
#!/usr/bin/env python3
"""
Test script to run Julia tutorial asynchronously
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path


async def run_julia_tutorial():
    """Run the Julia tutorial script asynchronously"""
    try:
        # Get the directory where this script is located
        script_dir = Path(__file__).parent
        julia_script = script_dir / "tutorial.jl"

        print(f"Running Julia tutorial from: {script_dir}")
        print(f"Julia script: {julia_script}")

        # Check if the Julia script exists
        if not julia_script.exists():
            print(f"Error: Julia script not found at {julia_script}")
            return False

        # Run Julia script asynchronously
        process = await asyncio.create_subprocess_exec(
            "julia",
            str(julia_script),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(script_dir),
        )

        print("Julia tutorial started...")

        # Wait for completion and capture output
        stdout, stderr = await process.communicate()

        # Print output
        if stdout:
            print("STDOUT:")
            print(stdout.decode())

        if stderr:
            print("STDERR:")
            print(stderr.decode())

        # Check return code
        if process.returncode == 0:
            print("✅ Julia tutorial completed successfully!")
            return True
        else:
            print(f"❌ Julia tutorial failed with return code: {process.returncode}")
            return False

    except FileNotFoundError:
        print(
            "❌ Error: Julia not found. Please install Julia and ensure it's in your PATH"
        )
        return False
    except Exception as e:
        print(f"❌ Error running Julia tutorial: {e}")
        return False


async def main():
    """Main function"""
    print("🚀 Starting Julia tutorial execution...")
    print("=" * 50)

    success = await run_julia_tutorial()

    print("=" * 50)
    if success:
        print("🎉 Finished running Julia tutorial successfully!")
    else:
        print("💥 Julia tutorial execution failed!")

    return success


if __name__ == "__main__":
    # Run the async main function
    result = asyncio.run(main())
    sys.exit(0 if result else 1)

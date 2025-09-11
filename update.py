import subprocess

# Configuration
REPO_DIR = "."      
IMAGE_NAME = "tulrex"
CONTAINER_NAME = "tulrex"
HOST_PORT = "8080"                      # host port to map
CONTAINER_PORT = "80"                   # container port

def run(cmd):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}")


# Step 2: Build Docker image
run(f"docker build -t {IMAGE_NAME} {REPO_DIR}")

# Step 3: Stop old container (if exists)
# Here we ignore the fails
subprocess.run(f"docker stop {CONTAINER_NAME}", shell=True)
subprocess.run(f"docker rm {CONTAINER_NAME}", shell=True)

# Step 4: Run new container
run(f"docker run -d --name {CONTAINER_NAME} -p {HOST_PORT}:{CONTAINER_PORT} {IMAGE_NAME}")

print("Update complete!")

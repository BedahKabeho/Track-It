# Use Python 3.14 as the base image.
# The slim version is smaller and contains only essential packages.
FROM python:3.14-slim

# Set /app as the working directory inside the container.
# All the following commands will run from this directory.
WORKDIR /app

# Copy requirements.txt from our backend folder into the container.
# This file contains the Python packages required by Django.
COPY requirements.txt .

# Install all Python packages listed in requirements.txt.
# --no-cache-dir prevents pip from storing unnecessary cache files,
# which helps reduce the Docker image size.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the remaining backend project files into the container.
# The first dot means the current build context on our computer.
# The second dot means the current working directory (/app) in Docker.
COPY . .

# Document that our Django application listens on port 8000.
# This does not automatically make the port accessible from our computer.
EXPOSE 8000

# Start the Django development server when the container runs.
# 0.0.0.0 allows Django to accept connections from outside the container.
# Port 8000 is where our backend API will run.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]

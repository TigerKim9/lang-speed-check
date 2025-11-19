FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg2 \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install programming languages
RUN apt-get update && apt-get install -y \
    # C/C++
    gcc \
    g++ \
    # Python
    python3 \
    python3-pip \
    # Java
    default-jdk \
    # Ruby
    ruby \
    # PHP
    php-cli \
    # Go
    golang-go \
    # Rust
    rustc \
    && rm -rf /var/lib/apt/lists/*

# Install Zig
RUN wget https://ziglang.org/download/0.11.0/zig-linux-x86_64-0.11.0.tar.xz \
    && tar -xf zig-linux-x86_64-0.11.0.tar.xz \
    && mv zig-linux-x86_64-0.11.0 /usr/local/zig \
    && ln -s /usr/local/zig/zig /usr/local/bin/zig \
    && rm zig-linux-x86_64-0.11.0.tar.xz

# Install Dart
RUN wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/dart.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/dart.gpg arch=amd64] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main' | tee /etc/apt/sources.list.d/dart_stable.list \
    && apt-get update \
    && apt-get install -y dart \
    && rm -rf /var/lib/apt/lists/*

# Install Kotlin
RUN curl -s https://get.sdkman.io | bash \
    && bash -c "source /root/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

# Add Kotlin to PATH
ENV PATH="/root/.sdkman/candidates/kotlin/current/bin:${PATH}"

# Add Dart to PATH
ENV PATH="/usr/lib/dart/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Create temp directory for code execution
RUN mkdir -p /app/temp

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

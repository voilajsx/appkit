#!/bin/bash
# Script to create the folder and file structure for @voilajsx/appkit documentation site

# Set text colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up @voilajsx/appkit documentation site structure...${NC}"

# Create root level project files
echo -e "${YELLOW}Creating root level files...${NC}"
touch package.json
touch index.html
touch vite.config.js
touch tailwind.config.js
touch postcss.config.js
touch tsconfig.json
touch .eslintrc.js
touch .prettierrc

# Create main src directory and subdirectories
echo -e "${YELLOW}Creating src directory and main files...${NC}"
mkdir -p src
touch src/main.jsx
touch src/App.jsx

# Create assets directory structure
echo -e "${YELLOW}Creating assets directories...${NC}"
mkdir -p src/assets/images
mkdir -p src/assets/fonts
touch src/assets/images/logo.svg

# Create components directory structure
echo -e "${YELLOW}Creating component directories...${NC}"
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/docs

# Create layout components
echo -e "${YELLOW}Creating layout components...${NC}"
touch src/components/layout/Header.jsx
touch src/components/layout/Footer.jsx
touch src/components/layout/MainLayout.jsx
touch src/components/layout/Sidebar.jsx

# Create UI components
echo -e "${YELLOW}Creating UI components...${NC}"
touch src/components/ui/Button.jsx
touch src/components/ui/Card.jsx
touch src/components/ui/CodeBlock.jsx
touch src/components/ui/Search.jsx

# Create docs components
echo -e "${YELLOW}Creating docs-specific components...${NC}"
touch src/components/docs/ModuleCard.jsx
touch src/components/docs/TableOfContents.jsx
touch src/components/docs/ApiTable.jsx

# Create hooks directory
echo -e "${YELLOW}Creating hooks...${NC}"
mkdir -p src/hooks
touch src/hooks/useModules.js
touch src/hooks/useDocContent.js
touch src/hooks/useTableOfContents.js

# Create utils directory
echo -e "${YELLOW}Creating utility files...${NC}"
mkdir -p src/utils
touch src/utils/markdownUtils.js
touch src/utils/navigationUtils.js
touch src/utils/codeUtils.js

# Create pages directory
echo -e "${YELLOW}Creating page components...${NC}"
mkdir -p src/pages
touch src/pages/Home.jsx
touch src/pages/Documentation.jsx
touch src/pages/ModuleIndex.jsx
touch src/pages/DocPage.jsx
touch src/pages/NotFound.jsx

# Create routes directory
echo -e "${YELLOW}Creating routing...${NC}"
mkdir -p src/routes
touch src/routes/index.jsx

# Create styles directory
echo -e "${YELLOW}Creating styles...${NC}"
mkdir -p src/styles
touch src/styles/globals.css
touch src/styles/markdown.css

# Create content directory structure
echo -e "${YELLOW}Creating documentation content structure...${NC}"
mkdir -p src/content/modules/auth
mkdir -p src/content/modules/logging
mkdir -p src/content/general

# Create auth module documentation
touch src/content/modules/auth/index.md
touch src/content/modules/auth/api-reference.md
touch src/content/modules/auth/examples.md

# Create logging module documentation
touch src/content/modules/logging/index.md
touch src/content/modules/logging/api-reference.md
touch src/content/modules/logging/examples.md

# Create general documentation
touch src/content/general/getting-started.md
touch src/content/general/installation.md
touch src/content/general/contributing.md

# Create public directory
echo -e "${YELLOW}Creating public directory...${NC}"
mkdir -p public
touch public/favicon.ico
touch public/robots.txt

# Create scripts directory
echo -e "${YELLOW}Creating build scripts...${NC}"
mkdir -p scripts
touch scripts/build-docs.js

# Adding executable permissions to the script
chmod +x scripts/build-docs.js

echo -e "${GREEN}Documentation site structure has been successfully created!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Install dependencies with 'npm install'"
echo "2. Start the development server with 'npm run dev'"
echo "3. Begin implementing the components and adding content"
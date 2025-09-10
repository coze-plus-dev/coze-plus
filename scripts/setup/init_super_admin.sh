#!/bin/bash
#
# Copyright 2025 coze-plus Authors  
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Script for initializing super admin user
# This script should be run AFTER the database migration is complete
# It sets the correct password for the super admin user

set -e

echo "🚀 Initializing Super Admin User..."

# Super Admin Configuration
SUPER_ADMIN_EMAIL="administrator@coze-plus.cn"
SUPER_ADMIN_PASSWORD="coze-plus123456"

# Read MySQL configuration from environment or use defaults
MYSQL_USER="${MYSQL_USER:-coze}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-coze123}"
MYSQL_DATABASE="${MYSQL_DATABASE:-opencoze}"
MYSQL_CONTAINER="coze-mysql"

echo "📧 Super Admin Email: $SUPER_ADMIN_EMAIL"

# Check if argon2-cffi is installed
if ! python3 -c "import argon2" 2>/dev/null; then
    echo "❌ Error: argon2-cffi library is required"
    echo "Please install it using one of the following commands:"
    echo "  - For Python 2: pip install argon2"
    echo "  - For Python 3: pip install argon2-cffi"
    echo "  - For conda: conda install argon2-cffi"
    exit 1
fi

# Python script to generate Argon2id hashed password
# This must be consistent with the Go implementation in user_impl.go
PYTHON_SCRIPT=$(cat << 'EOF'
import argon2
import sys

def hash_password(password):
    # Default Argon2id parameters, consistent with Go code
    memory = 64 * 1024  # 64MB
    iterations = 3
    parallelism = 4
    salt_length = 16
    key_length = 32
    
    # Create Argon2 hasher with exact same parameters as Go code
    hasher = argon2.PasswordHasher(
        memory_cost=memory,
        time_cost=iterations,
        parallelism=parallelism,
        hash_len=key_length,
        salt_len=salt_length
    )
    
    # Generate hash
    hashed = hasher.hash(password)
    return hashed

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <password>")
        sys.exit(1)
    
    password = sys.argv[1]
    hashed_password = hash_password(password)
    print(hashed_password)
EOF
)

# Check if MySQL container is running
if ! docker ps | grep -q "$MYSQL_CONTAINER"; then
    echo "❌ Error: MySQL container '$MYSQL_CONTAINER' is not running"
    echo "Please start MySQL container first:"
    echo "  cd docker && docker-compose up -d mysql"
    exit 1
fi

# Check if super admin user exists
echo "🔍 Checking if super admin user exists..."
USER_EXISTS=$(docker exec -i "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se \
    "SELECT COUNT(*) FROM user WHERE email = '$SUPER_ADMIN_EMAIL';")

if [ "$USER_EXISTS" -eq 0 ]; then
    echo "❌ Error: Super admin user not found in database"
    echo "Please run the database migration first:"
    echo "  make atlas-apply"
    echo "Or manually run the migration: 20250910000001_init_super_admin.sql"
    exit 1
fi

echo "✅ Super admin user found in database"

# Generate hashed password
echo "🔐 Generating secure password hash..."
HASHED_PASSWORD=$(echo "$PYTHON_SCRIPT" | python3 - "$SUPER_ADMIN_PASSWORD")

if [ -z "$HASHED_PASSWORD" ]; then
    echo "❌ Error: Password hash generation failed"
    exit 1
fi

echo "✅ Password hash generated successfully"

# Update the placeholder password with the real hashed password
echo "💾 Updating super admin password..."
SQL="UPDATE user SET password = '$HASHED_PASSWORD', updated_at = UNIX_TIMESTAMP(NOW()) * 1000 WHERE email = '$SUPER_ADMIN_EMAIL';"

RESULT=$(docker exec -i "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "$SQL" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Super admin password updated successfully"
else
    echo "❌ Error: Password update failed (exit code: $EXIT_CODE)"
    echo "$RESULT"
    exit 1
fi

# Verify super admin setup
echo "🔍 Verifying super admin setup..."
VERIFICATION_SQL="
SELECT 
    u.id, u.name, u.unique_name, u.email, u.user_verified, u.is_disabled,
    ur.role_id, r.role_code, r.role_name,
    s.id as space_id, s.name as space_name,
    su.role_type as space_role_type
FROM user u
LEFT JOIN user_role ur ON u.id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.id
LEFT JOIN space s ON u.id = s.owner_id
LEFT JOIN space_user su ON s.id = su.space_id AND u.id = su.user_id
WHERE u.email = '$SUPER_ADMIN_EMAIL';
"

echo "📊 Super Admin Configuration:"
docker exec -i "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "$VERIFICATION_SQL"

echo ""
echo "🎉 Super Admin initialization completed successfully!"
echo ""
echo "📋 Login Information:"
echo "   Email:    $SUPER_ADMIN_EMAIL"
echo "   Password: $SUPER_ADMIN_PASSWORD"
echo "   Username: Administrator"
echo ""
echo "🔒 Please change the default password after first login for security!"
echo "✨ You can now log in to the system with super admin privileges."
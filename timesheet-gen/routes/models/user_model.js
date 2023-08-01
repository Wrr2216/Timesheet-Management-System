const config = require("../../config");

const { Sequelize, DataTypes } = require("sequelize");

let sequelize;

try {
  sequelize = new Sequelize(
    config.sql.database,
    config.sql.user,
    config.sql.password,
    {
      host: config.sql.host,
      dialect: "mysql",
    }
  );
} catch (error) {
  console.error("Error connecting to MySQL database:", error);
}

// Defines a new sequelize user
const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_timesheet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    base: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
  }
);

// Find a user by id.
User.findById = async function (id) {
  try {
    const user = await User.findOne({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by id:", error);
  }
};

// Finds a user by username.
User.findByUsername = async function (username) {
  try {
    const user = await User.findOne({
      where: { username },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by username:", error);
  }
};

// Finds a user by email.
User.findByEmail = async function (email) {
  try {
    const user = await User.findOne({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
  }
};

// Update a user s password.
User.updatePassword = async function (id, password) {
  try {
    const user = await User.update(
      {
        password,
      },
      {
        where: { id },
      }
    );
  } catch (error) {
    console.error("Error updating user's password:", error);
  }
};

User.updateResetPasswordToken = async function (id, reset_password_token, expireDate) {
  try {
    const user = await User.update(
      {
        reset_password_token,
        reset_password_expires: expireDate,
      },
      {
        where: { id },
      }
    );

    return;
  } catch (error) {
    console.error("Error updating user's reset password token:", error);
  }
};

User.updatePasswordAndResetToken = async function (userId, passwordHash, resetToken, resetExpires) {
  try {
    const user = await User.update(
      {
        password: passwordHash,
        reset_password_token: resetToken,
        reset_password_expires: resetExpires,
      },
      {
        where: { id: userId },
      }
    );
    return user;
  } catch (error) {
    console.error("Error updating user's password and reset token:", error);
  }
};

User.findByResetPasswordToken = async function (resetPasswordToken) {
  try {
    const user = await User.findOne({
      where: {
        reset_password_token: resetPasswordToken,
      },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by reset password token:", error);
  }
};

// Updates the user s last timesheet.
User.updateLastTimesheet = async function (id, last_timesheet) {
  try {
    // Updates a user s reset password token.
    const user = await User.update(
      {
        last_timesheet,
      },
      {
        where: { id },
      }
    );
  } catch (error) {
    console.error("Error updating user's last timesheet:", error);
  }
};

// Get the user s last timesheet.
User.getLastTimesheet = async function (id) {
  try {
    const user = await User.findOne({
      where: { id },
    });

    return user.last_timesheet;
  } catch (error) {
    console.error("Error getting user's last timesheet:", error);
  }
};

// Updates a user.
User.updateUser = async function (
  id,
  first_name,
  last_name,
  role,
  username,
  email,
  base
) {
  const user = await User.update(
    {
      first_name,
      last_name,
      role,
      username,
      password,
      email,
      base,
    },
    {
      where: { id },
    }
  );
};

// Creates a new user.
User.createUser = async function (
  first_name,
  last_name,
  role,
  username,
  password,
  email,
  base
) {
  try {
    const user = await User.create({
      first_name,
      last_name,
      role,
      username,
      password,
      email,
      last_timesheet: null,
      base,
      reset_password_token: null,
      reset_password_expires: null,
    });
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

// Check if a user is an administrator or dev.
User.isAdministrator = async function (id) {
  try {
    const user = await User.findById(id);
    if (user.role === "admin" || user.role === "dev") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking if user is administrator:", error);
  }
};

// Destroys a user.
User.deleteById = async function (id) {
  try {
    const user = await User.destroy({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

module.exports = User;

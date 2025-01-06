'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agencies', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'roles',
            key: 'id'
          }
        }
      },
      country_code: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cash_capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      recharge_budget: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cashiers: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_active: {
        type: Sequelize.ENUM('0', '1', '2'),
        defaultValue: '0',
        allowNull: false
      },
      is_approved: {
        type: Sequelize.ENUM('0', '1', '2'),
        defaultValue: '1',
        allowNull: false
      },
      is_suspend: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      is_email_verified: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      is_deleted: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false
      },
      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      remember_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      zipcode: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      digital_signature: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_document: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      company_registration_document: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_first_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_second_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_birth_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      representative_phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_email: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_id_number: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_id_document: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      representative_profile: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('agencies');
  }
};

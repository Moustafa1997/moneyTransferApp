'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teller_accounts', {
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
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      year_since: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_suspend: {
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
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      state_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      city_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      zipcode: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      country_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'country_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      agency_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'agencies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      profile_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      digital_signature: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      uploaded_signature: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_document: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      location_latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      location_longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('teller_accounts');
  }
};

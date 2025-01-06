'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bank_transactions', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      client_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      agency_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'agencies',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      purpose: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount_received: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      stripe_fee: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      payment_method_options: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Details of the payment method options from Stripe'
      },
      stripe_payment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Stripe PaymentIntent ID'
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'usd'
      },
      status: {
        type: Sequelize.ENUM('0', '1', '2'),
        allowNull: false
      },
      stripe_status: {
        type: Sequelize.STRING,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bank_transactions');
  }
};

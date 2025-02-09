# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'
require 'bigdecimal'

require_relative 'amount'
require_relative 'unit'

# DSL for creating financial journals
module LedgerDSL
  # Represents an amount with an optional associated cost
  class CostedAmount
    extend T::Sig

    # Type of cost
    class CostType < T::Enum
      enums do
        None = new
        Total = new
        Unit = new
      end
    end

    sig do
      params(
        amount: T.any(Amount, BigDecimal, Integer, Float, Rational, String),
        cost: T.nilable(ToAmount),
        type: CostType
      ).void
    end
    def initialize(amount, cost: nil, type: CostType::None)
      # Extract cost and type from a string amount
      if cost.nil? && amount.is_a?(String)
        match = amount.match(/(.*)(@@?)(.*)/)
        if match
          amount = T.must(match[1]).strip
          cost = T.must(match[3]).strip
          type = match[2] == '@' ? CostType::Unit : CostType::Total
        end
      end

      @amount = T.let(Amount.from(amount), Amount)
      @cost = T.let(cost && Amount.from(cost), T.nilable(Amount))
      @type = T.let(type, CostType)
    end

    sig { params(costed_amount: ToCostedAmount).returns(CostedAmount) }
    def self.from(costed_amount)
      return costed_amount if costed_amount.is_a?(CostedAmount)

      CostedAmount.new(costed_amount)
    end

    sig { returns(String) }
    def to_ledger
      amount = @amount.to_ledger
      if @cost
        cost = @cost.to_ledger
        if @type == CostType::Unit
          "#{amount} @ #{cost}"
        else
          "#{amount} @@ #{cost}"
        end
      else
        amount
      end
    end

    sig { params(amount: ToAmount, unit: Unit).returns(CostedAmount) }
    def total_cost(amount, unit = EMPTY_UNIT)
      @cost = Amount.from(amount, unit)
      @type = CostType::Total
      self
    end

    sig { params(amount: ToAmount, unit: Unit).returns(CostedAmount) }
    def unit_cost(amount, unit = EMPTY_UNIT)
      @cost = Amount.from(amount, unit)
      @type = CostType::Unit
      self
    end
  end

  ToCostedAmount = T.type_alias { T.any(CostedAmount, Amount, BigDecimal, Integer, Float, Rational, String) }
end

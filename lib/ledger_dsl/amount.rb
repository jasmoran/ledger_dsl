# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'
require 'bigdecimal'

require_relative 'unit'

# DSL for creating financial journals
module LedgerDSL
  # Represents an amount
  class Amount
    extend T::Sig

    sig do
      params(
        value: T.any(BigDecimal, Integer, Float, Rational, String),
        unit: Unit
      ).void
    end
    def initialize(value, unit = EMPTY_UNIT)
      # Extract any unit from a string value
      if unit == EMPTY_UNIT && value.is_a?(String)
        match = value.match(/([^0-9.-]*)([0-9.-]+)([^0-9.-]*)/)
        if match
          unit = if match[1].to_s.empty?
                   Unit.new(symbol: match[3].to_s.strip, prefix: false)
                 else
                   Unit.new(symbol: match[1].to_s.strip, prefix: true)
                 end
          value = match[2].to_s
        end
      end

      @value = T.let(BigDecimal(value), BigDecimal)
      @unit = T.let(unit, Unit)
    end

    sig { params(amount: ToAmount).returns(Amount) }
    def self.from(amount)
      return amount if amount.is_a?(Amount)

      Amount.new(amount)
    end

    sig { returns(String) }
    def to_ledger
      formatted = format("%.#{@unit.precision}f", @value.round(@unit.precision).to_s('F'))
      if @unit.prefix
        "#{@unit.symbol}#{formatted}"
      else
        "#{formatted} #{@unit.symbol}"
      end
    end
  end

  ToAmount = T.type_alias { T.any(Amount, BigDecimal, Integer, Float, Rational, String) }
end

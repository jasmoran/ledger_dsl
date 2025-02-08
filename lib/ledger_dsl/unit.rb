# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'

# DSL for creating financial journals
module LedgerDSL
  # Represents units of amount
  class Unit
    extend T::Sig

    sig { params(symbol: T.nilable(String), precision: Integer, prefix: T::Boolean).void }
    def initialize(symbol: nil, precision: 2, prefix: true)
      @symbol = T.let(symbol, T.nilable(String))
      @precision = T.let(precision, Integer)
      @prefix = T.let(prefix, T::Boolean)
    end

    sig { returns(T.nilable(String)) }
    attr_reader :symbol

    sig { returns(Integer) }
    attr_reader :precision

    sig { returns(T::Boolean) }
    attr_reader :prefix

    sig { params(unit: ToUnit).returns(Unit) }
    def self.from(unit)
      return unit if unit.is_a?(Unit)

      Unit.new(symbol: unit)
    end
  end

  ToUnit = T.type_alias { T.any(Unit, String) }
  EMPTY_UNIT = Unit.new
end

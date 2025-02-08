# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'
require 'date'

# DSL for creating financial journals
module LedgerDSL
  extend T::Sig

  sig { params(date: ToDate).returns(Date) }
  def self.date_from(date)
    return date if date.is_a?(Date)

    Date.parse(date)
  end

  ToDate = T.type_alias { T.any(Date, String) }
end

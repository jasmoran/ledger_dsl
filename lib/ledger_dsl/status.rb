# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'

# DSL for creating financial journals
module LedgerDSL
  # Transaction/posting status
  class Status < T::Enum
    enums do
      Unmarked = new
      Cleared = new
      Pending = new
    end
  end
end

# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'

require_relative 'transaction'
require_relative 'comment'
require_relative 'status'

# LedgerDSL for creating financial journals
module LedgerDSL
  # Represents a collection of financial transactions
  class Journal
    extend T::Sig

    sig { void }
    def initialize
      @entries = T.let([], T::Array[T.any(Transaction, Comment)])
    end

    # Create a new transaction in the journal
    sig do
      params(
        date: ToDate,
        status: Status,
        code: T.nilable(String),
        payee: T.nilable(String),
        note: T.nilable(String),
        tags: String,
        blk: T.nilable(T.proc.bind(Transaction).params(t: Transaction).void)
      ).returns(Transaction)
    end
    def transaction(date, status: Status::Unmarked, code: nil, payee: nil, note: nil, **tags, &blk)
      transaction = Transaction.new(date, status: status, code: code, payee: payee, note: note, **tags)
      transaction.instance_exec(transaction, &blk) if block_given?
      @entries << transaction
      transaction
    end
    alias tr transaction

    # Create a new comment in the journal
    sig { params(comment: ToComment).returns(Comment) }
    def comment(comment)
      comment = Comment.from(comment)
      @entries << Comment.from(comment)
      comment
    end

    sig { returns(String) }
    def to_ledger
      @entries.map { |entry| entry.to_ledger(0) }.join("\n\n")
    end
  end

  sig do
    params(blk: T.nilable(T.proc.bind(LedgerDSL::Journal).params(j: LedgerDSL::Journal).void)).returns(LedgerDSL::Journal)
  end
  def self.journal(&blk)
    journal = LedgerDSL::Journal.new
    journal.instance_exec(journal, &blk) if Kernel.block_given?
    journal
  end
end

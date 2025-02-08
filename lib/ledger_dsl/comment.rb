# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'

# DSL for creating financial journals
module LedgerDSL
  # A comment in a transaction or journal
  class Comment
    extend T::Sig

    sig { params(text: String).void }
    def initialize(text)
      @text = T.let(text, String)
    end

    sig { params(comment: ToComment).returns(Comment) }
    def self.from(comment)
      return comment if comment.is_a?(Comment)

      Comment.new(comment)
    end

    sig { params(indent: Integer).returns(String) }
    def to_ledger(indent)
      @text.split("\n").map { |line| "#{' ' * indent}; #{line.strip}" }.join("\n")
    end
  end

  ToComment = T.type_alias { T.any(Comment, String) }
end

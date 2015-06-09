package rules

type Contexter interface {
	ApplyRules([]BusinessRuler, Contexter) error
	Execute() error
}

type BusinessRuler interface {
	Action(Contexter) error
}

type RulesRunner struct{}

func (rr RulesRunner) ApplyRules(rules []BusinessRuler, ctx Contexter) error {
	if len(rules) > 0 {
		for _, rule := range rules {
			err := rule.Action(ctx)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
